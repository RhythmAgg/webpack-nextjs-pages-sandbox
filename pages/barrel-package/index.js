// "use client"
// import dynamic from 'next/dynamic';
// import Image from 'next/image';

// console.log('helo')
// const Image = dynamic(() => import('next/image'))


// import dynamic from "next/dynamic";
// import Image from "next/image";
// export  * as all  from './test1';

// export function Testinline() {
//     return (
//         <h1>Hello</h1>
//     )
// }
export { Test1 } from './test1'
export { Test2 } from './test2'
export {default as Test3} from '../test3';
