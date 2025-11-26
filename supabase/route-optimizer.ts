import { createClient } from "npm:@supabase/supabase-js@2.36.0";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ADD_LOCATION_KEY = Deno.env.get("ADD_LOCATION_KEY");
const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) console.error("Missing Supabase env vars");
// if (!ADD_LOCATION_KEY) console.error("Missing ADD_LOCATION_KEY");
if (!GOOGLE_MAPS_API_KEY) console.error("Missing GOOGLE_MAPS_API_KEY");
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        persistSession: false
    },
    global: {
        headers: {
            "x-client-info": "edge-route-optimizer"
        }
    }
});
const sanitizeTable = (t)=>t.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
const fetchLocationsByIds = async (table, ids)=>{
    const { data, error } = await sb.from(table).select("*").in("id", ids);
    if (error) throw new Error(error.message);
    if (!data) throw new Error("No rows returned");
    return data;
};
const toLatLngStr = (p)=>`${p.lat},${p.lng}`;
Deno.serve(async (req)=>{
    try {
        if (req.method !== "POST") return new Response(JSON.stringify({
            error: "Method Not Allowed"
        }), {
            status: 405,
            headers: {
                "Content-Type": "application/json"
            }
        });
        // const providedKey = req.headers.get("x-api-key");
        // if (!providedKey || providedKey !== ADD_LOCATION_KEY) {
        //   return new Response(JSON.stringify({
        //     error: "Unauthorized"
        //   }), {
        //     status: 401,
        //     headers: {
        //       "Content-Type": "application/json"
        //     }
        //   });
        // }
        const body = await req.json().catch(()=>null);
        if (!body) return new Response(JSON.stringify({
            error: "Invalid JSON"
        }), {
            status: 400,
            headers: {
                "Content-Type": "application/json"
            }
        });
        const payload = body;
        if (!payload.table || !Array.isArray(payload.ids) || payload.ids.length === 0 || !payload.currentLocation) {
            return new Response(JSON.stringify({
                error: "Missing required fields: table, ids, currentLocation"
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        const table = sanitizeTable(payload.table);
        if (!table) return new Response(JSON.stringify({
            error: "Invalid table name"
        }), {
            status: 400,
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (payload.ids.length > 12) return new Response(JSON.stringify({
            error: "Max 12 waypoints allowed"
        }), {
            status: 400,
            headers: {
                "Content-Type": "application/json"
            }
        });
        const dbIdsToFetch = [
            ...new Set([
                ...payload.ids,
                ...payload.destinationId ? [
                    payload.destinationId
                ] : []
            ])
        ].filter(Boolean);
        const rows = await fetchLocationsByIds(table, dbIdsToFetch);
        const findById = (id)=>rows.find((r)=>String(r.id) === String(id));
        let originLatLng = payload.currentLocation;
        let destinationLatLng = null;
        if (payload.destination) destinationLatLng = payload.destination;
        else if (payload.destinationId) {
            const r = findById(payload.destinationId);
            if (!r) return new Response(JSON.stringify({
                error: "destinationId not found"
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            destinationLatLng = {
                lat: Number(r.latitude),
                lng: Number(r.longitude)
            };
        }
        const waypointRows = payload.ids.map((id)=>{
            const r = findById(id);
            if (!r) throw new Error(`Waypoint id ${id} not found`);
            return {
                id: r.id,
                lat: Number(r.latitude),
                lng: Number(r.longitude),
                raw: r
            };
        });
        const travelMode = payload.travelMode ?? "driving";
        const returnDirections = payload.returnDirections === true; // default false
        let originStr;
        let destinationStr;
        let waypointsForGoogle = [];
        if (originLatLng) originStr = toLatLngStr(originLatLng);
        else {
            const first = waypointRows[0];
            originStr = toLatLngStr({
                lat: first.lat,
                lng: first.lng
            });
        }
        if (destinationLatLng) destinationStr = toLatLngStr(destinationLatLng);
        else {
            const last = waypointRows[waypointRows.length - 1];
            destinationStr = toLatLngStr({
                lat: last.lat,
                lng: last.lng
            });
        }
        const inputWaypointEntries = waypointRows.map((w)=>({
            id: w.id,
            lat: w.lat,
            lng: w.lng
        }));
        const waypointEntriesFiltered = inputWaypointEntries.filter((e)=>{
            const coord = `${e.lat},${e.lng}`;
            if (coord === originStr) return false;
            if (coord === destinationStr) return false;
            return true;
        });
        waypointsForGoogle = waypointEntriesFiltered.map((e)=>({
            lat: e.lat,
            lng: e.lng
        }));
        const waypointsParam = waypointsForGoogle.length > 0 ? `optimize:true|${waypointsForGoogle.map((p)=>`${p.lat},${p.lng}`).join("|")}` : undefined;
        const params = new URLSearchParams();
        params.set("origin", originStr);
        params.set("destination", destinationStr);
        params.set("key", GOOGLE_MAPS_API_KEY);
        params.set("mode", travelMode);
        if (waypointsParam) params.set("waypoints", waypointsParam);
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
        const gRes = await fetch(directionsUrl);
        if (!gRes.ok) {
            const txt = await gRes.text();
            throw new Error(`Google Directions API error: ${gRes.status} ${txt}`);
        }
        const directionsJson = await gRes.json();
        if (directionsJson.status !== "OK" && directionsJson.status !== "ZERO_RESULTS") {
            return new Response(JSON.stringify({
                error: `Google Directions error: ${directionsJson.status}`,
                details: directionsJson
            }), {
                status: 502,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        const route = directionsJson.routes && directionsJson.routes[0];
        let waypointOrder = [];
        if (route && Array.isArray(route.waypoint_order)) {
            waypointOrder = route.waypoint_order;
        }
        const inputWaypointIdsForGoogle = waypointEntriesFiltered.map((e)=>e.id);
        let orderedWaypointIds = [];
        if (waypointOrder.length > 0) {
            orderedWaypointIds = waypointOrder.map((i)=>inputWaypointIdsForGoogle[i]);
        } else {
            orderedWaypointIds = inputWaypointIdsForGoogle;
        }
        const finalOrderedIds = [...orderedWaypointIds];
        if (!payload.destination && payload.destinationId) {
            finalOrderedIds.push(payload.destinationId);
        } else if (!payload.destination && !payload.destinationId) {
            const lastWaypointId = payload.ids[payload.ids.length - 1];
            if (lastWaypointId && !finalOrderedIds.includes(lastWaypointId)) finalOrderedIds.push(lastWaypointId);
        }
        const dedupedFinalOrderedIds = Array.from(new Set(finalOrderedIds));
        const orderedLocations = dedupedFinalOrderedIds.map((id)=>rows.find((r)=>String(r.id) === String(id))).filter(Boolean);
        let totalDistanceMeters = 0;
        let totalDurationSeconds = 0;
        if (route && Array.isArray(route.legs)) {
            for (const leg of route.legs){
                if (leg.distance && typeof leg.distance.value === "number") totalDistanceMeters += leg.distance.value;
                if (leg.duration && typeof leg.duration.value === "number") totalDurationSeconds += leg.duration.value;
            }
        }
        // Build maps deep link (use coordinates)
        const encode = (s)=>encodeURIComponent(s);
        const originForUrl = originStr;
        const destinationForUrl = destinationStr;
        const waypointsForUrl = waypointsForGoogle.map((p)=>`${p.lat},${p.lng}`).join("|");
        const mapsUrlBase = "https://www.google.com/maps/dir/?api=1";
        const mapsParams = new URLSearchParams();
        mapsParams.set("origin", originForUrl);
        mapsParams.set("destination", destinationForUrl);
        mapsParams.set("travelmode", travelMode);
        if (waypointsForUrl) mapsParams.set("waypoints", waypointsForUrl);
        const mapsUrl = `${mapsUrlBase}&${mapsParams.toString()}`;
        const resp = {
            orderedIds: dedupedFinalOrderedIds,
            orderedLocations,
            totalDistanceMeters,
            totalDurationSeconds,
            mapsUrl
        };
        if (returnDirections) resp.directions = directionsJson;
        return new Response(JSON.stringify(resp), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (err) {
        console.error("route-optimizer error:", err);
        return new Response(JSON.stringify({
            error: err instanceof Error ? err.message : String(err)
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
});
