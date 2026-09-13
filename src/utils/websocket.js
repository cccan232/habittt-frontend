import { useUserStore } from '@/stores/user'
import { ElNotification } from 'element-plus'

let ws = null;
const WS_URL = 'ws://localhost:8080/ws';

export const initWebSocket = () => {
    const userStore = useUserStore();
    const userId = userStore.userInfo?.id;
    
    if (!userId || ws) return;

    ws = new WebSocket(`${WS_URL}/${userId}`);

    ws.onopen = () => {
        console.log('WebSocket 连接成功');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('收到实时消息:', data);

        if (data.type === 'notification') {
            // 实时弹出通知
            ElNotification({
                title: data.title,
                message: data.content,
                type: 'info',
            });
            // 可以在这里触发 Pinia 更新未读通知数量
        } else if (data.type === 'chat') {
            // 触发聊天室更新事件
            window.dispatchEvent(new CustomEvent('new-chat-message', { detail: data }));
        }
    };

    ws.onclose = () => {
        console.log('WebSocket 连接关闭');
        ws = null;
    };

    ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
    };
};
