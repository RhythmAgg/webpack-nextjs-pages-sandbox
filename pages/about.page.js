import styles from "@/styles/page.module.css";
// import { Test1, Test2 } from "./barrel-package";
import { Rectangle, Cube } from "./Components";


export default function About() {
  return (
    <>
      <Rectangle />
      {/* <Cube /> */}
      {/* <Test1 /> */}
      <h1>This is About</h1>
    </>
  )
}
