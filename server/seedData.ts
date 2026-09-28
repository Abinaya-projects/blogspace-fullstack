import bcrypt from 'bcryptjs';
import { localDB, saveLocalDB } from './config/db.js';
import { UserModel } from './models/User.js';
import { PostModel } from './models/Post.js';
import { CommentModel } from './models/Comment.js';

export const seedInitialData = async () => {
  try {
    const existingUsers = await UserModel.findOne({ email: 'demo@blogspace.io' });
    if (existingUsers) {
      console.log('Database already initialized with seed data.');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Authors
    const demoUser = await UserModel.create({
      name: 'Abinaya Vance',
      email: 'demo@blogspace.io',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Full-stack builder and technical writer exploring distributed systems, modern frontend architecture, and design clarity.',
    });

    const techAuthor = await UserModel.create({
      name: 'Elena Rostova',
      email: 'elena@blogspace.io',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      bio: 'Lead Systems Architect & AI Researcher. Writing on high-throughput backend runtimes and neural interfaces.',
    });

    const designAuthor = await UserModel.create({
      name: 'Marcus Chen',
      email: 'marcus@blogspace.io',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Principal Product Designer focusing on typography systems, micro-interactions, and human-computer symbiosis.',
    });

    // 2. Create Featured Posts
    const post1 = await PostModel.create({
      title: 'Architecting Resilient Real-Time Systems at Hyperscale',
      content: `Distributed engineering in modern cloud environments demands an uncompromising stance on fault isolation and predictability. When services handle millions of concurrent operations per minute, the classical approach of synchronous request-response chains breaks down.

### The Problem with Cascading Backpressure
In traditional tiered architectures, a single degraded downstream database cluster can quickly saturate thread pools across the entire API gateway tier. Without proactive rate-limiting tokens and localized circuit-breakers, the system rapidly devolves into cascading collapse.

\`\`\`typescript
// Idempotent retry policy with exponential jitter
export async function executeWithRetry<T>(
  action: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 150
): Promise<T> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await action();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts) throw err;
      const jitter = Math.random() * 50;
      const delay = Math.pow(2, attempt) * baseDelayMs + jitter;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}
\`\`\`

### Event-Driven CQRS as the Structural Antidote
By separating our command pipeline from query materialized views, we decouple write throughput from read spikes. Materialized projections update asynchronously via log-structured streaming topics, yielding sub-10ms response times for consumer reads.

Key architectural takeaways:
1. Prefer pull-based backpressure over unbounded unbounded memory buffers.
2. Maintain strict transactional boundaries around domain aggregates.
3. Treat telemetry and structured distributed traces as primary product deliverables.`,
      category: 'Technology',
      image: '/src/assets/images/post_tech_ai_1790610180057.jpg',
      author: techAuthor._id,
    });

    const post2 = await PostModel.create({
      title: 'The Discipline of Whitespace: Beyond Generic UI Aesthetics',
      content: `The modern web has suffered from a surplus of visual noise. Everywhere you look, rounded pill containers wrap every single timestamp, candy-colored gradient borders fight for attention, and arbitrary decorative icons prefix every line of prose.

### The Tyranny of the Border
When designers lack confidence in spatial rhythm, they reach for borders and nested boxes. Yet visual hierarchy is fundamentally about optical grouping, not physical fences. 

> "Whitespace is not empty space; it is the physical breathing room that allows ideas to penetrate and resonate."

### The 60-30-10 Rule in Practice
Every screen should establish a clear focal carrier. When everything screams for attention, nothing is heard.
- 60% dominant neutral surface that grounds the eye
- 30% structural text and quiet contextual framing
- 10% high-intent accent reserved exclusively for decisive user actions

When you remove the decorative pills and let typography speak with purposeful weights and measured line lengths (65 to 75 characters per measure), your product immediately feels mature, confident, and professional.`,
      category: 'Design',
      image: '/src/assets/images/post_design_systems_1790610193082.jpg',
      author: designAuthor._id,
    });

    const post3 = await PostModel.create({
      title: 'Deep Work in the Age of Constant Interruption: A Field Guide',
      content: `Cognitive fatigue is rarely caused by the difficulty of our tasks; it is caused by the micro-switching of attention. Every ping, badge notification, and open tab extracts a cognitive tax that takes up to twenty-three minutes to recover from.

### Designing a Solitary Morning Protocol
For the past two years, I instituted a strict morning routine:
1. No screen engagement during the first sixty minutes after waking.
2. A single analog notebook to outline the primary objective of the day.
3. A uninterrupted 90-minute writing and architecture block with all notifications silenced.

The result was not merely higher output—it was work of significantly greater philosophical depth and technical durability. When you protect your attention with religious discipline, you reclaim the joy of genuine craftsmanship.`,
      category: 'Lifestyle',
      image: '/src/assets/images/post_lifestyle_mindfulness_1790610205164.jpg',
      author: demoUser._id,
    });

    const post4 = await PostModel.create({
      title: 'From Monolith to Modular Micro-frontends: Practical Lessons',
      content: `Micro-frontends are frequently hailed as an organizational silver bullet, but they introduce profound trade-offs in bundle size, shared dependencies, and state orchestration.

Before breaking your application into independent remotes, assess whether your team structure actually mirrors Conway's Law. If you have fewer than thirty engineers, an enforced modular monolith with strict domain boundaries inside a unified monorepo will almost always outperform micro-frontends in velocity and operational sanity.

Focus on clear module contracts and shared domain types before attempting dynamic runtime module federation.`,
      category: 'Technology',
      image: '/src/assets/images/hero_creative_workspace_1790610168996.jpg',
      author: techAuthor._id,
    });

    // 3. Create Comments
    await CommentModel.create({
      content: 'The section on cascading backpressure hits close to home. We suffered a major incident last month precisely because thread pools saturated during a downstream replica failover. Excellent code pattern!',
      author: demoUser._id,
      post: post1._id,
    });
    await PostModel.incrementCommentsCount(post1._id, 1);

    await CommentModel.create({
      content: 'Could not agree more with the critique of pill capsules! Clean typographic separation with middle dots is so much calmer on the eyes.',
      author: techAuthor._id,
      post: post2._id,
    });
    await PostModel.incrementCommentsCount(post2._id, 1);

    await CommentModel.create({
      content: 'The 90-minute uninterrupted morning block has transformed my research productivity. Thank you for articulating this so clearly.',
      author: designAuthor._id,
      post: post3._id,
    });
    await PostModel.incrementCommentsCount(post3._id, 1);

    console.log('Initial sample posts, authors, and comments seeded successfully.');
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
};
