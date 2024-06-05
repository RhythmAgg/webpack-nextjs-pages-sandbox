import {debounce}  from "lodash"
import Image from "next/image"

// console.log('hi')
// const obj = {
//     x: 5
// }
function Call() {
    console.log('hi')
}
// const x = /*#__PURE__*/ Call()
// const x = Call()

// export { x }

export default function Test3() {
    return <h1>Test 3</h1>
}

export function double(a){
    const ans = 2*a;
    return ans;
}
