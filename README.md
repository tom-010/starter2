# boring-stack

> Boring and Fast.

## Getting things done, creating value, making money

The goal of this project is **Developer Velocity**!!!

Get things done, deliver value, take your share and make money.

We do not get paid for code quality, architecture, or test coverage. We get paid for solving problems and putting features into the hands of users.

> Features are revenue. Code is inventory.

Every line of code you write is a cost. It is a liability that must be debugged, read, and maintained. Our optimization target is to turn ideas into shipped software as fast as possible, maximizing utility while minimizing the syntax required to achieve it.

We want stability. We want ease. We want to ship.

## Boring is Fast

Stability is Velocity. If you don't have to learn a new framework every six months, you can exploit your knowledge for decades. "Boring" means the failure modes are known. It means StackOverflow is full of answers. It means the library won't disappear next year.

We use a simple heuristic: Technologies that have been around a long time (SQL, HTTP, HTML) will likely remain around for a long time. They have survived the filter of time. We bet on standards, not the hype cycle.

A "crazy boring" architecture frees you to think about the *domain* and the *product*. Complexity in the stack steals cognitive capacity from the features that actually make money. Proven web technology reduces the "unknown unknowns."

## The Stack and changeable Choices, based on principles

This repository is a specific set of technology choices made to support the goal of velocity. You can change them, but the principles behind them are rigorous.

### The Return to Standards via React Router v7 (SSR) 

We chose React Router v7 because it brings back the mental model of 2005 (Request → Loader → HTML) but with modern component architecture. It relies on web standards (Forms, Links, HTTP), not proprietary framework magic. This ensures stability: the web isn't going to break backward compatibility. Next.js and others introduce too much complexity and vendor lock-in.

### TypeScript Types for Fast Feedback

We introduce types not for "purity," but for speed. The compiler catches errors faster than you can run the code. It provides a tight feedback loop that allows for aggressive refactoring without fear.

### Just use Postgres - for state and everything else

We use Postgres for application data, authentication, and background jobs. We refuse to manage Redis or message queues until absolutely necessary.
Prisma is chosen because it allows us to stop thinking about SQL syntax and focus on data. It provides strong type safety across the entire boundary. The "Active Record" pattern of fetching, modifying, and saving objects is fast and intuitive. State management is the source of most complexity. We just put it into the DB and nowhere else.

### Python for AI-Stuff

Python is the language of AI. It is a first-class citizen, but it has a specific job: AI and Heavy Compute.
We do not use Python for general web logic; TypeScript is faster and type-safe in the browser. However, we do not rewrite AI libraries in Node. If a task is easier in Python (e.g., image processing, LLM integration), we use Python. It runs as a co-located service via type-safe RPC, not a loose REST API.

### Good enough UI via Shadcn

We do not care about custom design systems. In B2B apps, a "good enough" consistent UI is all that is required. The value is in the functionality, not the pixel-perfection.
We use Shadcn because we own the code (copy-paste) and it uses standard Tailwind classes. No fighting with component library overrides. Tailwind for no CSS to reduce stuff to care and keeping things local.

## Focus on hard things, let agents do the rest

This stack is optimized for Agentic Coding for your velocity.

The workflow is simple: Experienced developers handle the complex architecture and hard logic. Agents handle the boilerplate, the grunt work, and the easy features.

The nice thing: boring is good for devs AND agent-readable. Things that are easy for humans to reason about are easy for Agents to reason about.

* Explicit over Implicit: We use `routes.ts` instead of file-system routing because it provides a clear, hallucination-free map of the application.
* No Magic: Agents struggle with "automagical" imports and complex abstractions. Boring patterns are predictable.
* Type Safety: Types provide the Agent with the same feedback loop they provide you. If it compiles, it likely works.

Complexity slows everyone down. Simplicity enables you to work in parallel with your AI sidekick.

## Development Principles

### Code is a Liability; Mutability is the Only Code Quality Metric

Every line of code creates maintenance debt and entropy. The objective is maximum utility via minimum syntax. Static "quality" is irrelevant if the system resists modification; a rigid system that functions correctly is a failure. Therefore, subtraction is superior to addition, and explicit duplication is scientifically superior to premature abstraction. Wrong abstractions introduce invisible, high-cost dependencies that cripple future velocity.

### The Bottleneck is Cognitive Capacity, Not Hardware

Software velocity is constrained by the developer's working memory, not CPU cycles. "Clever" code exhausts this resource; "boring," predictable code preserves it for domain logic. Enforce strict uniformity to eliminate decision fatigue regarding implementation details. Optimize for locality—co-locating related logic—to minimize context switching. Coupling is the primary enemy of cognitive containment; distinctness enables speed.

### Scale is a Distraction; Architect Only for Now

Speculative architecture for hypothetical futures is resource waste. Solve strictly for the immediate reality (e.g., 10 users). Leverage "Lindy" technologies—proven standards like SQL and HTTP—where failure modes are known; novelty introduces unquantified risk. Speed today is a requirement; speed tomorrow is achieved not by generic flexibility, but by a disciplined refusal to couple components.

### Value Follows a Power Law; Imperfection is Economic

The majority of utility derives from a minority of features. Perfectionism in the "long tail" or secondary UI is economic malpractice. Real-world usage is the only valid validation mechanism for the scientific method. Consequently, rapid, imperfect shipping outperforms perfect planning. A solution exists only when value is delivered; until then, it is merely inventory.

### Tactical Rules

* The URL is the Source of Truth: The Database is the State. The Client is just a View. No API Layer, no client state like Redux, no loading spinners.
* Co-location is King: Put things together, best in a single file.
* No Magic: Explicit configuration beats convention.
* Keep it Simple: No caching layer until you can prove you need it.
* The Programmers Time, Brain-Capacity and Happiness are the most important resource.

## It is for experienced devs who want to get stuff done

This starter is for experienced devs of B2B applications who want to get stuff done and ship value fast. It is to reduce the headache of all the new shiny toys and focus on things that matter.

It is for experienced engineers who are tired of the fluff, the hype, and the churn. It is for those who understand that value comes from shipping features that users pay for, not from playing with shiny new toys.

If you value velocity, stability, and making money over architectural purity, this is for you.

## Quick Start

See [Quick Start Guide](./docs/quick-start.md) in the [docs](./docs/README.md)

## Contributing

Issues and contributions are welcome.
