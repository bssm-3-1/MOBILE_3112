import React from 'react';
import {View, StyleSheet, Text, Pressable} from 'react-native';
import * as Sentry from '@sentry/react-native';
import {log} from "../utils/logger";

interface State {
    hasError: boolean;
    error: Error | null;
}

interface Props {
    children: React.ReactNode;
    /** 커스텀 fallback을 주입하면 DefaultFallback 대신 렌더됩니다. */
    fallback?: React.ReactNode;
    /** 에러 발생 시 외부 핸들러 호출 */
    onError?: (error: Error, info: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, error: null };

    // 렌더 직전에 호출 — state만 업데이트, 부수 효과 금지
    static getDerivedStateFromError(error: Error): State {
        // TODO 1-1. hasError: true, error를 담은 State 객체를 반환하세요.
        return { hasError: true, error };
    }

    // 렌더 완료 후 호출 — 부수 효과(로깅, 네트워크) 허용
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] caught:', error.message);
        console.error('[ErrorBoundary] stack:', info.componentStack);
        log('error', error.message, { componentStack: info.componentStack ?? ''});

        Sentry.captureException(error, { extra: info as unknown as Record<string, unknown> });

        // TODO 1-2. this.props.onError?.(error, info)를 호출하세요.
        this.props.onError?.(error, info);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // TODO 1-3. props.fallback이 있으면 fallback을, 없으면 DefaultFallback을 렌더링하세요.
            //           DefaultFallback에는 error={this.state.error} onReset={this.handleReset}을 전달합니다.
            if (this.props.fallback) {
                return this.props.fallback;
            }
            else return <DefaultFallback error={this.state.error} onReset={this.handleReset} />;
        }
        return this.props.children;
    }
}

function DefaultFallback({
    error,
    onReset,
}: {
    error: Error | null;
    onReset: () => void;
}) {
    return (
        <View style={styles.container}>
            {/* TODO 1-4. 아래 3가지를 구현하세요.
                  - 에러 메시지 텍스트 (기술적 내용을 그대로 노출하지 말 것)
                  - "다시 시도" Pressable 버튼 (onPress: onReset)
                  - 에러 코드 텍스트 (error?.message?.slice(0, 24) ?? 'UNKNOWN')
            */}
            <Text style={styles.message}>문제가 발생했어요</Text>
            <Pressable style={styles.button} onPress={onReset}><Text style={styles.buttonText}>다시 시도</Text></Pressable>
            <Text>{error?.message?.slice(0, 24) ?? 'UNKNOWN'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 12,
        backgroundColor: '#fff',
    },
    // TODO 1-4. 필요한 스타일을 추가하세요.
    message: {
      fontSize: 18, fontWeight: '600',
    },
    button: {
        backgroundColor: '#5a67d8', padding: 12, borderRadius: 8
    },
    buttonText: {
        color: '#fff', fontWeight: '600',
    }
});
