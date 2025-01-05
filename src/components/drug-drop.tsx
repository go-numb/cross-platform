import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { Button, Col, Row } from "antd";

import { useEffect, useState } from "react";

export const GetPaths = () => {
    const [filePaths, setFilePaths] = useState<string[]>([]);

    useEffect(() => {
        // ファイルドロップイベントをリッスン
        let unlisten: UnlistenFn;
        const setupListener = async () => {
            // tauri v2指定定数
            unlisten = await listen<string[]>('tauri://drag-drop', (event: any) => {
                console.log('Dropped files:', event.payload.paths);
                const filepath = event.payload.paths;
                if (filepath && filepath.length > 0) {
                    setFilePaths((prev) => [...new Set([...prev, ...filepath])]);
                }
                console.log('Dropped files:', filePaths);

            });
        };

        setupListener();

        return () => {
            if (unlisten) {
                unlisten();
            }
        };
    }, []);

    // 指定インデックスのファイルパスの配列を上に移動
    const up = (index: number) => {
        setFilePaths((prev) => {
            console.log('prev:', prev, 'index:', index);

            if (index <= 0) return prev;

            const newPaths = [...prev];
            const tmp = newPaths[index];
            newPaths[index] = newPaths[index - 1];
            newPaths[index - 1] = tmp;
            return newPaths;
        });
    };

    // ファイルパスを下に移動
    const down = (index: number) => {
        setFilePaths((prev) => {
            console.log('prev:', prev, 'index:', index);

            if (index >= prev.length - 1) return prev;

            const newPaths = [...prev];
            const tmp = newPaths[index];
            newPaths[index] = newPaths[index + 1];
            newPaths[index + 1] = tmp;
            return newPaths;
        });
    };

    // ファイルパスを削除
    const del = (index: number) => {
        console.log('index:', index);

        setFilePaths((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div>
            {
                filePaths ? (
                    <div style={{ textAlign: 'left' }}>
                        <p>ファイルがドロップされました</p>
                        <p>ファイルパス:</p>
                        <ul>
                            {filePaths.map((path, index) => (
                                <li key={index}>
                                    <Row gutter={[16, 16]}>
                                        <Col span={18}>{path}</Col>
                                        <Col span={6}>
                                            <Button type="text" onClick={() => up(index)}>
                                                ↑
                                            </Button>
                                            <Button type="text" onClick={() => down(index)}>
                                                ↓
                                            </Button>
                                            <Button type="text" onClick={() => del(index)}>
                                                🗑️
                                            </Button>
                                        </Col>
                                    </Row>

                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>ファイルをドロップしてください</p>
                )
            }
        </div>
    );
};
