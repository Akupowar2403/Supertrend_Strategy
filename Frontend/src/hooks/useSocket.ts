// hooks/useSocket.ts — Connection status hook
import { useEffect, useState } from "react"
import { socket } from "../socket/socket"

export function useSocket() {
  const [connected, setConnected] = useState(socket.connected)

  useEffect(() => {
    const onConnect    = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on("connect",    onConnect)
    socket.on("disconnect", onDisconnect)

    return () => {
      socket.off("connect",    onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [])

  return { connected, socket }
}
