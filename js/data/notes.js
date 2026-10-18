/**
 * Saurav Pandey - Field Notes & Research
 * Expandable technical writings and engineering reflections.
 */
window.PORTFOLIO_NOTES = [
  {
    id: "note-servlets-vs-spring",
    title: "Why I Built CommerceBase in Core Java Servlets Instead of Spring Boot",
    date: "October 2026",
    readingTime: "4 min read",
    category: "Architecture & Systems",
    summary: "Reflections on learning the fundamentals of the JVM, HTTP request dispatching, and thread safety from first principles before adopting high-level enterprise abstractions.",
    content: `
When building CommerceBase for my BCA Major Project, the conventional advice was to spin up a Spring Boot template with dozens of starter dependencies. Instead, I intentionally restricted the implementation to Core Java Servlets, JSP, and direct JDBC.

Here is why:
1. **Understanding the Servlet Lifecycle**: Grasping \`init()\`, \`service()\`, and \`destroy()\` demystifies how web servers handle multithreaded requests per HTTP connection.
2. **Session and State Mechanics**: Manually configuring \`HttpSession\` cookies and validating query parameters forces disciplined defense-in-depth against SQL injection and CSRF without assuming a framework will magically fix it.
3. **Deterministic Performance**: The resulting deployment is ultra-lightweight, with instant boot times and near-zero memory overhead.

In complex information systems, knowing what lies beneath high-level abstractions is what separates a true systems engineer from a framework user.
    `
  },
  {
    id: "note-icp-canister-actors",
    title: "Decentralized State: How Internet Computer Canisters Differ from Ethereum",
    date: "September 2026",
    readingTime: "5 min read",
    category: "Web3 & Distributed Systems",
    summary: "Exploring the actor model, orthogonal persistence, and the 'reverse gas' model that makes building on the Internet Computer feel like modern cloud computing.",
    content: `
Building my NFT-Marketplace-DApp on the Internet Computer (ICP) revealed fundamental differences from traditional EVM-based blockchains:

1. **Orthogonal Persistence**: Canister smart contracts run WebAssembly bytecode. Developers do not need to manually read and write to a separate disk or database; the canister's memory heap automatically persists across executions.
2. **The Reverse Gas Model**: On Ethereum, users must pay gas for every single read or write transaction, creating massive friction. On ICP, developers pre-fund canisters with cycles, allowing end users to interact with decentralized web apps for free.
3. **Serving the Frontend from Canisters**: The frontend HTML, CSS, and JavaScript run directly out of on-chain canister storage rather than an AWS S3 bucket, fulfilling the vision of true end-to-end decentralization.
    `
  },
  {
    id: "note-cpp-bitwise-encryption",
    title: "Practical Bitwise Operations and Binary File Streams in Core C++",
    date: "August 2026",
    readingTime: "3 min read",
    category: "Systems & Security",
    summary: "A technical walkthrough of processing arbitrary binary streams with std::fstream and applying symmetric rotational transformations.",
    content: `
Developing CryptoLock-Encryption-Utility underscored the beauty of standard C++ when working close to the hardware:

- **Handling Arbitrary Byte Streams**: Opening files with \`std::ios::binary\` ensures that newline translations (e.g. \`\\r\\n\` on Windows) do not alter byte sequences in executable or image payloads.
- **Buffer Management**: Rather than reading entire multi-megabyte files into memory, streaming chunks via dedicated byte buffers preserves constant memory consumption regardless of input size.
- **Rotational XOR Transformations**: Utilizing cyclic key masking demonstrates how bitwise manipulation directly alters register values with sub-millisecond execution speeds.
    `
  }
];
