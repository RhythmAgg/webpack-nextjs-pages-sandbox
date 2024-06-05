// "use client"

import { useState } from "react"

// export default function Test1() {
//     return <h1>This is Test 1</h1>

// }
export function Test1() {
    const [x, setX] = useState(0)
    return <h1>This is Test 1 {x}</h1>
}

// export function SecondTest1() {
//     return <h1>This is Second Test 1</h1>
// }