import {useEffect, useRef, useState} from "react"

type Platform = "weflab" | "soop" | "chzzk"

type PlatformWS = {
    key: Platform
    label: string
    ws: string
}

type ChatProps = {
    urls: PlatformWS[]
    chatType: "all" | Platform,
    onlyDonation: boolean
}

type ChatMessage = {
    platform: Platform
    user: string
    message: string
    value?: number
    type?: string
}

export default function Chat({ urls, chatType, onlyDonation }: ChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const chatRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        chatRef.current?.scrollIntoView({ behavior: "auto" })
    }, [messages])

    function normalizeMessage(platform: Platform, data: any): ChatMessage | null {
        if (platform === "weflab") {
            return {
                platform: "weflab",
                user: data.uname,
                message: data.message,
                value: data.value,
                type: "donation",
            }
        }

        if (platform === "soop") {
            return {
                platform: "soop",
                user: data.name,
                message: data.message,
                value: data.value,
                type: data.type
            }
        }

        if (platform === "chzzk") {
            const isDonation = data.msgType === 10

            return {
                platform: "chzzk",
                user: data.user?.nickname,
                message: data.msg,
                type: isDonation ? "donation" : "chat",
                value: isDonation ? data.donation?.payAmount : 0
            }
        }

        return null
    }

    useEffect(() => {
        const sockets: WebSocket[] = []
        urls.forEach((p) => {
            if (p.ws.includes("undefined")) return
            const ws = new WebSocket(p.ws)

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                const msg = normalizeMessage(p.key, data)

                if (!msg) return
                if (chatType !== "all" && chatType !== msg.platform) return

                if (onlyDonation && msg.type!="donation") {
                    return
                }

                setMessages(prev => {
                    const next = [...prev, msg]
                    return next.slice(-200)
                })
            }

            sockets.push(ws)
        })

        return () => {
            sockets.forEach(s => s.close())
        }

    }, [urls, chatType])

    return (
        <div className="chat-box">
            {messages.map((m, i) => {
                if (m.type === "donation") {
                    return (
                        <div key={i} className={`msg donation ${m.platform}`}>
                            <b>{m.user}</b> {m.value?.toLocaleString()}
                            {m.message && <div>{m.message}</div>}
                        </div>
                    )
                }

                return (
                    <div key={i} className={`msg ${m.platform}`}>
                        <b>{m.user}</b> : {m.message}
                    </div>
                )
            })}
            <div ref={chatRef}></div>
        </div>
    )
}
//  ${m.type}