import Colors from '@/constants/Colors';
import React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from './useColorScheme';

interface RouteOptimizationAnimationProps {
  visible: boolean;
  type: 'loading' | 'success';
  message?: string;
}

export const RouteOptimizationAnimation: React.FC<RouteOptimizationAnimationProps> = ({
    visible,
    type,
    message
}) => {
    const colorScheme = useColorScheme();
    const spinValue = new Animated.Value(0);
    const scaleValue = new Animated.Value(0);

    React.useEffect(() => {
        if (visible && type === 'loading') {
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [visible, type]);

    React.useEffect(() => {
        if (visible && type === 'success') {
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.back(1.5)),
                    useNativeDriver: true,
                }),
                Animated.delay(1000),
            ]).start();
        } else {
            scaleValue.setValue(0);
        }
    }, [visible, type]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={[
                styles.container,
                { backgroundColor: Colors[colorScheme ?? 'light'].card }
            ]}>
                {type === 'loading' && (
                    <>
                        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                            <View style={[
                                styles.spinnerInner,
                                { borderTopColor: Colors[colorScheme ?? 'light'].tint }
                            ]} />
                        </Animated.View>
                        <Text style={[
                            styles.message,
                            { color: Colors[colorScheme ?? 'light'].text }
                        ]}>
                            {message || 'Optimizing route...'}
                        </Text>
                    </>
                )}
        
                {type === 'success' && (
                    <>
                        <Animated.View style={[
                            styles.successContainer,
                            { transform: [{ scale: scaleValue }] }
                        ]}>
                            <View style={[
                                styles.successCircle,
                                { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                            ]}>
                                <Text style={styles.checkmark}>✓</Text>
                            </View>
                        </Animated.View>
                        <Text style={[
                            styles.message,
                            { color: Colors[colorScheme ?? 'light'].text }
                        ]}>
                            {message || 'Route optimized successfully!'}
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        padding: 30,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
        minHeight: 150,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    spinner: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    spinnerInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: 'transparent',
        borderTopColor: '#007AFF',
    },
    successContainer: {
        marginBottom: 16,
    },
    successCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: 'green',
        fontSize: 28,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
