# PhotoCon Engine (Rust + WebAssembly)

This directory will contain the Rust source code for high-performance image processing.

## Planned Workflow
1.  **Rust Source**: Write image processing logic (resize, crop, filter) in Rust.
2.  **wasm-pack**: Compile Rust to WebAssembly.
3.  **Integration**: Import the generated Wasm module into Next.js components in `src/app/(tools)`.

## Libraries to use
*   `image`: For basic image manipulation.
*   `wasm-bindgen`: For communicating between JS and Rust.
