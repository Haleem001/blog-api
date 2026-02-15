require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Blog = require('../models/blog.model');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

const blogContent = {
    // Python & Backend Development
    "Building RESTful APIs with FastAPI": {
        description: "A comprehensive guide to building scalable RESTful APIs using FastAPI framework",
        body: `FastAPI is a modern, fast web framework for building APIs with Python 3.6+ based on standard Python type hints. In this guide, we'll explore how to create robust and scalable RESTful APIs.\n\nKey advantages of FastAPI:\n- Automatic API documentation\n- Built-in data validation\n- High performance\n- Easy deployment\n\nLet's start by installing FastAPI and creating your first endpoint...`,
        tags: ["Python", "FastAPI", "Backend", "REST API"]
    },
    "Django Best Practices for Enterprise Applications": {
        description: "Enterprise-level Django development patterns and practices",
        body: `Django is a powerful web framework that scales with your project. In this article, we discuss best practices for building enterprise applications.\n\nTopics covered:\n1. Project structure and organization\n2. Database migrations and ORM optimization\n3. Authentication and permission systems\n4. API design patterns\n5. Testing strategies\n\nFollow these practices to build maintainable Django applications...`,
        tags: ["Django", "Python", "Enterprise", "Best Practices"]
    },
    "Python Async Programming with asyncio": {
        description: "Master asynchronous programming in Python for high-performance applications",
        body: `Asynchronous programming is essential for building responsive applications. Learn how to use Python's asyncio library to write concurrent code.\n\nIn this tutorial, you'll learn:\n- Event loops and coroutines\n- async/await syntax\n- Managing multiple concurrent tasks\n- Common pitfalls and how to avoid them`,
        tags: ["Python", "Async", "Performance", "Concurrency"]
    },
    "Error Handling in Python Web Applications": {
        description: "Comprehensive guide to error handling strategies",
        body: `Proper error handling is crucial for application stability. Learn different strategies for handling exceptions in Python web applications.\n\nCovers:\n- Custom exceptions\n- Middleware error handling\n- Logging best practices\n- User-friendly error responses`,
        tags: ["Python", "Error Handling", "Best Practices"]
    },
    
    // Frontend & React
    "React Hooks Deep Dive": {
        description: "Understanding React Hooks and building custom hooks",
        body: `React Hooks revolutionized how we write React components. This guide covers useState, useEffect, useContext, and creating custom hooks.\n\nTopics:\n1. State management with hooks\n2. Side effects with useEffect\n3. Custom hooks patterns\n4. Performance optimization with useMemo and useCallback`,
        tags: ["React", "JavaScript", "Hooks", "Frontend"]
    },
    "Building Responsive UIs with React and Tailwind CSS": {
        description: "Create beautiful, responsive user interfaces",
        body: `Learn how to combine React with Tailwind CSS to build stunning, responsive web applications.\n\nYou'll discover:\n- Responsive design principles\n- Tailwind utility classes\n- Component composition\n- Mobile-first approach`,
        tags: ["React", "Tailwind CSS", "CSS", "Frontend"]
    },
    "State Management in React: Context vs Redux": {
        description: "Comparing different state management approaches",
        body: `Understanding when to use Context API vs Redux in your React applications.\n\nContext API:\n- Built-in solution\n- Good for simple applications\n- Easier to learn\n\nRedux:\n- Complex state management\n- Time-travel debugging\n- Middleware ecosystem`,
        tags: ["React", "State Management", "Redux", "Context API"]
    },
    
    // Node.js
    "Building Production-Ready Node.js Applications": {
        description: "Best practices for deploying Node.js apps to production",
        body: `Node.js powers many modern web applications. Learn how to build, test, and deploy production-ready Node.js applications.\n\nKey topics:\n1. Environment configuration\n2. Error handling and logging\n3. Database connection pooling\n4. Performance monitoring\n5. Security best practices`,
        tags: ["Node.js", "Backend", "Production", "DevOps"]
    },
    "Express.js Middleware: A Complete Guide": {
        description: "Master the Express.js middleware concept",
        body: `Middleware is the backbone of Express applications. This guide covers how to write, order, and manage middleware.\n\nCovered:\n- Built-in middleware\n- Custom middleware creation\n- Error handling middleware\n- Middleware ordering and execution`,
        tags: ["Express", "Node.js", "Middleware"]
    },
    "WebSockets with Node.js: Real-time Communication": {
        description: "Building real-time applications with WebSockets",
        body: `WebSockets enable two-way communication between client and server. Learn to build real-time applications using Socket.io.\n\nTopics:\n- WebSocket protocol\n- Socket.io library\n- Event handling\n- Broadcasting messages`,
        tags: ["Node.js", "WebSockets", "Real-time", "Socket.io"]
    },
    
    // Windows & Development Tools
    "WSL2 Setup Guide for Windows Developers": {
        description: "Complete guide to setting up Windows Subsystem for Linux 2",
        body: `WSL2 provides a full Linux environment on Windows. This guide walks you through installation and configuration.\n\nSetup includes:\n1. Enabling WSL features\n2. Installing a Linux distribution\n3. Configuring Docker integration\n4. Setting up development tools\n5. Performance optimization tips`,
        tags: ["WSL", "Windows", "Linux", "Development Tools"]
    },
    "Android Studio on WSL: A Developer's Guide": {
        description: "Running Android Studio efficiently on Windows Subsystem for Linux",
        body: `Developing for Android on WSL can be tricky. Here's how to set it up properly.\n\nIncludes:\n- Installation process\n- Emulator configuration\n- Performance tuning\n- Common issues and solutions`,
        tags: ["Android Studio", "WSL", "Mobile Development"]
    },
    "Terminal Customization for Maximum Productivity": {
        description: "Making your Windows terminal work harder for you",
        body: `A well-configured terminal can significantly boost productivity. Learn customization techniques for Windows Terminal.\n\nTopics:\n- Color schemes and fonts\n- PowerShell profiles\n- Key bindings\n- Plugin integration`,
        tags: ["Terminal", "Windows", "Productivity", "Tools"]
    },
    
    // Testing & Quality Assurance
    "Unit Testing with Jest: A Practical Guide": {
        description: "Writing effective unit tests with Jest",
        body: `Jest is a popular testing framework for JavaScript. Learn to write comprehensive unit tests.\n\nCovered:\n- Test structure\n- Mocking and spying\n- Async testing\n- Code coverage\n- Best practices`,
        tags: ["Jest", "Testing", "JavaScript", "QA"]
    },
    "Test-Driven Development: From Theory to Practice": {
        description: "Implementing TDD in your projects",
        body: `Test-Driven Development (TDD) improves code quality. Learn the TDD cycle and best practices.\n\nKey concepts:\n- Red-Green-Refactor cycle\n- Writing testable code\n- Integration testing\n- Performance testing`,
        tags: ["Testing", "TDD", "Quality Assurance"]
    },
    "LLM-Powered Test Case Generation for REST APIs": {
        description: "Using Large Language Models to automate test generation",
        body: `Automating test case generation with LLMs can save time and improve coverage. This explores how to leverage AI for API testing.\n\nTopics:\n- LLM APIs and prompting\n- Test case generation patterns\n- Validation strategies\n- Integration with CI/CD pipelines`,
        tags: ["LLM", "Testing", "AI", "REST API", "Automation"]
    },
    
    // Projects & Startups
    "Building SparkClean Services: A Pest Control SaaS": {
        description: "Journey of building a service-based SaaS platform",
        body: `SparkClean Services is a pest control and cleaning venture. Here's how we built a scalable platform.\n\nDevelopment aspects:\n1. Service booking system\n2. Customer management\n3. Scheduling algorithms\n4. Payment integration\n5. Tracking and analytics`,
        tags: ["SaaS", "Startup", "Business", "Platform"]
    },
    "WeRise: Building a Health Survey Application": {
        description: "Creating engaging health assessment tools",
        body: `WeRise is a health survey application designed to gather wellness insights. Learn about the development process.\n\nFeatures:\n- Survey creation and management\n- Data collection and analysis\n- User engagement strategies\n- Privacy and data security`,
        tags: ["Health Tech", "Survey App", "Data Analytics"]
    },
    "SpielFeld (SPF): Sports and Community Platform": {
        description: "Connecting sports enthusiasts and community members",
        body: `SpielFeld is a platform bringing sports and community together. Discover the architecture and development approach.\n\nKey features:\n- Event management\n- Community features\n- Live updates\n- Social networking`,
        tags: ["Sports", "Community", "Platform", "Social"]
    },
    "Building an Audio Chat Application": {
        description: "Creating seamless voice communication features",
        body: `Audio chat applications require careful architecture for real-time communication. Learn the technical implementation.\n\nTopics:\n- WebRTC integration\n- Audio compression\n- Network optimization\n- Echo cancellation`,
        tags: ["Audio", "Real-time", "WebRTC", "Communication"]
    },
    
    // Software Engineering & Research
    "Software Engineering: From Theory to Practice": {
        description: "Applying software engineering principles in real projects",
        body: `Software Engineering encompasses more than just coding. Learn about design patterns, architecture, and best practices.\n\nCovered:\n- Design patterns (Singleton, Factory, Observer)\n- Architectural patterns (MVC, Microservices)\n- SOLID principles\n- Code reviews and collaboration`,
        tags: ["Software Engineering", "Design Patterns", "Architecture"]
    },
    "Thesis Topic: LLM-Based Test Generation for APIs": {
        description: "Research on automated test case generation",
        body: `My M.Sc thesis focuses on how LLMs can automate test case generation for RESTful APIs. This is a groundbreaking approach to quality assurance.\n\nResearch areas:\n- LLM prompt engineering\n- Test case validity\n- Coverage analysis\n- Performance metrics`,
        tags: ["Research", "LLM", "Testing", "APIs"]
    },
    "Winning HackJos 2025 with AgriVault": {
        description: "Our journey to victory at HackJos 2025",
        body: `AgriVault won first place at HackJos 2025. Here's how we built an innovative agricultural technology solution.\n\nKey achievements:\n1. Problem identification\n2. Rapid prototyping\n3. Team collaboration\n4. Pitch and presentation\n5. Innovation and implementation`,
        tags: ["Hackathon", "AgriVault", "Innovation", "TeamWork"]
    },
    "FlexiSAF Experience: Building Education Technology": {
        description: "Insights from working with FlexiSAF",
        body: `During my stint at FlexiSAF, I worked on education technology solutions. Learn about the experience and lessons learned.\n\nFocus areas:\n- User-centric design\n- Scalability challenges\n- Educational technology trends\n- Team dynamics`,
        tags: ["EdTech", "FlexiSAF", "Career", "Experience"]
    },
    
    // Technical Deep Dives
    "Database Optimization: Indexes and Query Performance": {
        description: "Making your database queries faster",
        body: `Database performance is critical for application speed. Learn indexing strategies and query optimization.\n\nTopics:\n- B-tree indexes\n- Query execution plans\n- Slow query logs\n- Denormalization vs normalization`,
        tags: ["Database", "Performance", "Optimization", "SQL"]
    },
    "Docker & Containerization for Developers": {
        description: "Containerizing your applications effectively",
        body: `Docker makes deployment consistent across environments. Learn to containerize and orchestrate applications.\n\nCovered:\n- Dockerfile creation\n- Image optimization\n- Docker Compose\n- Container networking`,
        tags: ["Docker", "Containers", "DevOps", "Deployment"]
    },
    "Microservices Architecture: Challenges and Solutions": {
        description: "Building scalable systems with microservices",
        body: `Microservices offer scalability but introduce complexity. Learn when and how to implement microservices.\n\nTopics:\n- Service decomposition\n- Communication patterns\n- Data consistency\n- Observability and monitoring`,
        tags: ["Microservices", "Architecture", "Scalability"]
    },
    "API Security Best Practices": {
        description: "Protecting your APIs from common attacks",
        body: `API security is paramount. Learn about authentication, authorization, and protection against common vulnerabilities.\n\nSecurity measures:\n1. JWT and OAuth2\n2. Rate limiting\n3. Input validation\n4. CORS configuration\n5. SQL injection prevention`,
        tags: ["Security", "API", "Authentication", "Best Practices"]
    },
    "Debugging Production Issues: Tools and Techniques": {
        description: "Strategies for finding and fixing production bugs",
        body: `Production issues require systematic debugging. Learn tools and techniques for efficient troubleshooting.\n\nApproaches:\n- Logging strategies\n- Performance profiling\n- Memory analysis\n- Distributed tracing`,
        tags: ["Debugging", "Production", "Tools", "Problem-solving"]
    },
    
    // Personal Tech & Lifestyle
    "Off-Grid Solar Setup: 15.36 kWh Battery System": {
        description: "Building a sustainable off-grid power system",
        body: `Living off-grid in Bauchi requires careful power management. Here's my 15.36 kWh battery system setup.\n\nSystem components:\n1. Solar panel array\n2. Battery storage\n3. Inverter system\n4. Charge controller\n5. Monitoring system\n\nDesign considerations for reliability and efficiency...`,
        tags: ["Solar", "Off-grid", "Sustainability", "DIY"]
    },
    "Astrophotography on a Budget: Moon and Star Photography": {
        description: "Capturing the night sky with affordable equipment",
        body: `Astrophotography doesn't require expensive gear. Learn to capture stunning moon and star photos.\n\nTechniques:\n- Moon phase photography\n- Star trails\n- Equipment setup\n- Post-processing tips\n- Best locations in Nigeria`,
        tags: ["Photography", "Astrophotography", "Moon", "Astronomy"]
    },
    "Samsung S23: Tips and Tricks for Power Users": {
        description: "Getting the most out of your Samsung S23",
        body: `The Samsung S23 is a powerful device. Discover hidden features and optimization tips.\n\nCovered:\n- Camera settings and modes\n- Battery optimization\n- Performance tuning\n- Security features\n- DeX mode for productivity`,
        tags: ["Samsung", "Mobile", "Tech", "Tips"]
    },
    
    // Anime & Entertainment
    "Solo Leveling: The Phenomenon of Webtoon Adaptations": {
        description: "Analyzing the Solo Leveling anime phenomenon",
        body: `Solo Leveling has taken the anime community by storm. This analysis explores why it resonates with audiences.\n\nTopics:\n- Character development\n- Art and animation quality\n- Story pacing\n- Global appeal\n- Webtoon to anime adaptations`,
        tags: ["Anime", "Solo Leveling", "Entertainment", "Analysis"]
    },
    "Hunter x Hunter: Character Development and Storytelling": {
        description: "Deep dive into one of anime's greatest series",
        body: `Hunter x Hunter is a masterpiece of anime storytelling. Explore its character arcs and narrative complexity.\n\nAnalysis includes:\n- Main characters evolution\n- Arc structure\n- Foreshadowing and mystery\n- Themes and philosophy\n- Why it remains timeless`,
        tags: ["Anime", "Hunter x Hunter", "Storytelling", "Philosophy"]
    },
    "Why I'm Obsessed with Anime: A Tech Guy's Perspective": {
        description: "My journey and passion for anime culture",
        body: `As a tech guy, you wouldn't expect anime to be a passion. But high-stakes anime like Solo Leveling and Hunter x Hunter offer more than entertainment.\n\nWhat draws me in:\n1. Complex storytelling\n2. Character psychology\n3. Animation artistry\n4. Thematic depth\n5. Community and culture`,
        tags: ["Anime", "Personal", "Culture", "Passion"]
    },
    "The Art of Anime Production: Behind the Scenes": {
        description: "Understanding anime creation process",
        body: `Anime production is complex and collaborative. Learn about the process from conception to broadcast.\n\nStages:\n- Script writing\n- Storyboarding\n- Animation\n- Sound design\n- Post-production`,
        tags: ["Anime", "Production", "Art", "Behind-the-scenes"]
    },
    
    // Career & Learning
    "Getting Started with Master's in Software Engineering": {
        description: "Pursuing advanced education in tech",
        body: `A Master's degree in Software Engineering opens new doors. Share my journey and lessons learned.\n\nTopics:\n- Choosing programs\n- Balancing work and study\n- Research opportunities\n- Career advancement\n- Industry relevance`,
        tags: ["Education", "Career", "Software Engineering", "Learning"]
    },
    "Building a Personal Brand as a Developer": {
        description: "Establishing yourself in the tech community",
        body: `A strong personal brand opens opportunities. Learn how to build yours as a developer.\n\nStrategies:\n1. Blog consistently\n2. Contribute to open source\n3. Build in public\n4. Network effectively\n5. Share knowledge`,
        tags: ["Personal Branding", "Career", "Developer", "Networking"]
    },
    "Remote Work as a Software Engineer: Pros and Cons": {
        description: "Perspectives on remote vs office work",
        body: `Remote work has transformed the tech industry. Explore the advantages and challenges.\n\nBenefits:\n- Flexibility\n- Work-life balance\n- Geographic freedom\n\nChallenges:\n- Communication\n- Team building\n- Focus and distractions`,
        tags: ["Remote Work", "Career", "Work-life Balance"]
    },
    "Learning Multiple Programming Languages Effectively": {
        description: "Strategies for becoming polyglot developer",
        body: `Python, JavaScript, Java - learning multiple languages. Here's my approach to effective language learning.\n\nTechniques:\n1. Focus on fundamentals\n2. Build projects\n3. Understand paradigms\n4. Read others' code\n5. Practice consistently`,
        tags: ["Learning", "Programming", "Languages", "Productivity"]
    },
    
    // Industry Insights
    "The Future of AI in Software Development": {
        description: "How AI is transforming software engineering",
        body: `AI and LLMs are revolutionizing how we write code. Explore the future of software development.\n\nTopics:\n- Code generation\n- Automated testing\n- Bug detection\n- Documentation\n- Ethics and responsibility`,
        tags: ["AI", "LLM", "Future", "Software Development"]
    },
    "Web3 and Blockchain: Understanding the Hype": {
        description: "Separating fact from fiction in blockchain",
        body: `Blockchain and Web3 are buzzwords. Let's understand the technology and real use cases.\n\nCovered:\n- Smart contracts\n- Decentralized apps\n- Cryptocurrencies\n- Enterprise blockchain\n- Limitations`,
        tags: ["Blockchain", "Web3", "Technology", "Analysis"]
    },
    "Cloud Computing Platforms: AWS vs Azure vs GCP": {
        description: "Comparing major cloud providers",
        body: `Choosing a cloud platform is crucial. Compare AWS, Azure, and GCP across various dimensions.\n\nComparison factors:\n1. Services offered\n2. Pricing models\n3. Learning curve\n4. Community support\n5. Enterprise features`,
        tags: ["Cloud", "AWS", "Azure", "GCP"]
    },
    "DevOps: Culture and Tools for Modern Development": {
        description: "Understanding DevOps philosophy and practices",
        body: `DevOps is more than tools - it's a culture. Learn practices for continuous integration and deployment.\n\nKey areas:\n- CI/CD pipelines\n- Infrastructure as Code\n- Monitoring and logging\n- Incident management\n- Team collaboration`,
        tags: ["DevOps", "CI/CD", "Infrastructure", "Automation"]
    }
};

// Create multiple users for blog authorship
const users = [
    { first_name: "Mahmud", last_name: "Ghali", email: "mahmud@example.com" },
    { first_name: "Haleem", last_name: "Tech", email: "haleem@example.com" },
    { first_name: "Ahmed", last_name: "Gee", email: "ahmed.dev@example.com" },
    { first_name: "Fatima", last_name: "Gee", email: "fatima.eng@example.com" },
    { first_name: "Hussaini", last_name: "Azare", email: "hussaini.azare@example.com" }
];

const states = ['draft', 'published'];

const seedDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        logger.success('Connected to MongoDB');

        // Clear existing data
        await Blog.deleteMany({});
        await User.deleteMany({});
        logger.success('Cleared existing blogs and users');

        // Create users
        const createdUsers = [];
        for (const user of users) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const newUser = await User.create({
                ...user,
                password: hashedPassword
            });
            createdUsers.push(newUser);
        }
        logger.success(`Created ${createdUsers.length} users`);

        // Create 50 blogs
        const blogs = [];
        const blogTitles = Object.keys(blogContent);
        
        for (let i = 0; i < 50; i++) {
            const title = blogTitles[i % blogTitles.length];
            const content = blogContent[title];
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const randomState = states[Math.floor(Math.random() * states.length)];

            const blog = await Blog.create({
                title: i === 0 ? title : `${title} - Part ${Math.floor(i / blogTitles.length) + 1}`,
                body: content.body,
                description: content.description,
                author: randomUser._id,
                state: randomState,
                tags: content.tags,
                read_count: Math.floor(Math.random() * 500),
                timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date in last 90 days
            });

            // Add blog to user's blogs array
            randomUser.blogs.push(blog._id);
            blogs.push(blog);
        }

        // Save all users with their blogs
        for (const user of createdUsers) {
            await user.save();
        }

        logger.success(`Created ${blogs.length} blogs`);

        // Display summary
        console.log('\n========== SEED SUMMARY ==========');
        console.log(`✓ ${createdUsers.length} users created`);
        console.log(`✓ ${blogs.length} blogs created`);
        console.log('\nUser Details:');
        createdUsers.forEach(user => {
            const userBlogs = blogs.filter(b => b.author.toString() === user._id.toString());
            console.log(`  - ${user.first_name} ${user.last_name} (${user.email}): ${userBlogs.length} blogs`);
        });
        
        console.log('\nBlog State Distribution:');
        const published = blogs.filter(b => b.state === 'published').length;
        const draft = blogs.filter(b => b.state === 'draft').length;
        console.log(`  - Published: ${published}`);
        console.log(`  - Draft: ${draft}`);
        
        console.log('\nTop Topics:');
        const tagCounts = {};
        blogs.forEach(blog => {
            blog.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([tag, count]) => {
                console.log(`  - ${tag}: ${count} blogs`);
            });

        console.log('\n==================================\n');
        logger.success('Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('Seeding failed', { error: error.message });
        console.error(error);
        process.exit(1);
    }
};

seedDB();
