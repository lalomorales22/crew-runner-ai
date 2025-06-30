# CrewRunner AI 🤖

**Intelligent Multi-Agent Automation Platform**

CrewRunner AI is a powerful web application that enables you to create, configure, and execute teams of specialized AI agents that collaborate to solve complex tasks. Inspired by the [CrewAI framework](https://crewai.com), this application brings intelligent multi-agent automation to the web with an intuitive interface for content creation, data analysis, and workflow automation.

![CrewRunner AI](https://img.shields.io/badge/CrewRunner-AI-purple?style=for-the-badge&logo=robot)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.8-green?style=for-the-badge&logo=vite)

## ✨ Features

### 🧠 AI-Powered Crew Generation
- **Smart Generation**: Describe your project and let AI automatically create specialized crews
- **Intelligent Agent Design**: AI generates agents with appropriate roles, goals, and tools
- **Task Automation**: Automatically creates task workflows based on your requirements

### 👥 Multi-Agent Collaboration
- **Specialized Agents**: Create agents with unique roles, goals, and backstories
- **Tool Integration**: Equip agents with specialized tools (web search, file processing, code analysis, etc.)
- **Flexible Workflows**: Support for sequential, hierarchical, and parallel execution processes

### 🌐 Real Web Search Integration
- **Tavily API Integration**: Enable agents to access real-time web information
- **Live Data Access**: Agents can search the web for current information during task execution
- **Smart Search Queries**: AI automatically generates relevant search queries based on task context
- **Comprehensive Results**: Get detailed search results with summaries and source links

### ⚡ Real-Time Execution
- **Live Monitoring**: Watch your crews execute tasks in real-time
- **Progress Tracking**: Visual progress indicators and detailed execution logs
- **Instant Feedback**: Real-time status updates and error handling

### 📁 Automated File Generation
- **Smart Output**: Crews automatically generate reports, documents, and analysis files
- **Multiple Formats**: Support for text, markdown, JSON, CSV, and more
- **File Management**: Built-in file viewer, editor, and download capabilities

### 🎨 Beautiful Interface
- **Modern Design**: Clean, intuitive interface with dark theme
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Live status indicators and progress visualization

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Groq API Key** (for AI functionality)
- **Tavily API Key** (optional, for web search functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lalomorales22/crew-runner-ai.git
   cd crew-runner-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_TAVILY_API_KEY=your_tavily_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to access CrewRunner AI

### Getting API Keys

#### Groq API Key (Required)
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### Tavily API Key (Optional - for Web Search)
1. Visit [Tavily](https://tavily.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env` file as `VITE_TAVILY_API_KEY`

**Note**: Without the Tavily API key, web search functionality will be simulated with example data.

## 🎯 How to Use

### 1. **Generate a Crew with AI**
- Click "Generate with AI" in the right sidebar
- Describe your project (e.g., "Create a content marketing crew that researches topics and writes articles")
- Let AI automatically generate agents and tasks
- Review and customize the generated crew

### 2. **Manual Crew Creation**
- Click "New Crew" to create from scratch
- Add agents with specific roles and goals
- Define tasks and assign them to agents
- Configure tools and execution process

### 3. **Enable Web Search (Optional)**
- Add your Tavily API key to the environment variables
- Assign the `web_search` tool to agents that need web access
- Agents will automatically search the web when tasks require current information

### 4. **Execute Your Crew**
- Click "Execute Crew" to start the workflow
- Monitor real-time progress and logs
- View generated files in the Files tab
- Download or share results

### 5. **Manage Results**
- Access all generated files in the Files tab
- View, edit, download, or share documents
- Track execution history and performance
- Export logs and reports

## 🛠️ Built With

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **AI Integration**: Groq SDK
- **Web Search**: Tavily API
- **State Management**: Zustand
- **Database**: SQL.js (client-side)
- **Icons**: Lucide React

## 📋 Use Cases

CrewRunner AI is perfect for:

- **Content Creation & Marketing**: Research, writing, and SEO optimization teams with web search
- **Market Research**: Real-time competitor analysis and trend identification
- **Software Development**: Code analysis, testing, and documentation crews
- **News & Information**: Current events research and reporting teams
- **Business Intelligence**: Data gathering and analysis with live web data
- **Customer Support**: Automated response systems with current information access
- **Academic Research**: Literature reviews and current research compilation

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🌐 Web Search Capabilities

When configured with a Tavily API key, CrewRunner AI provides:

- **Real-time Web Search**: Access current information from across the web
- **Smart Query Generation**: AI automatically creates relevant search queries
- **Comprehensive Results**: Detailed search results with content summaries
- **Source Attribution**: Full source links and publication dates
- **Answer Synthesis**: AI-generated summaries of search results
- **Follow-up Questions**: Suggested related queries for deeper research

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### CrewAI Framework
This application is inspired by and built upon concepts from the [CrewAI framework](https://crewai.com). CrewAI is a cutting-edge framework for orchestrating role-playing, autonomous AI agents that enables teams of agents to collaborate and tackle complex tasks.

**About CrewAI:**
- **Website**: [https://crewai.com](https://crewai.com)
- **GitHub**: [https://github.com/joaomdmoura/crewAI](https://github.com/joaomdmoura/crewAI)
- **Creator**: João Moura ([@joaomdmoura](https://github.com/joaomdmoura))

CrewAI provides the foundational concepts of multi-agent collaboration, role-based AI systems, and task orchestration that inspired the design and functionality of CrewRunner AI. We encourage users to explore the original CrewAI framework for production-grade multi-agent applications.

### Technology Stack
- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Groq](https://groq.com/)
- Web search powered by [Tavily](https://tavily.com/)
- Icons by [Lucide](https://lucide.dev/)
- Deployed with [Netlify](https://netlify.com/)

## 📞 Support

If you have any questions or need help getting started:

1. Check the [Issues](https://github.com/lalomorales22/crew-runner-ai/issues) page
2. Create a new issue if your question isn't answered
3. Join our community discussions

## 🔗 Related Projects

- **[CrewAI](https://crewai.com)** - The original framework that inspired this application
- **[CrewAI GitHub](https://github.com/joaomdmoura/crewAI)** - Official CrewAI repository
- **[CrewAI Documentation](https://docs.crewai.com)** - Comprehensive CrewAI documentation

---

**CrewRunner AI** - Empowering the future of intelligent automation 🚀

*Inspired by CrewAI - Bringing multi-agent collaboration to the web*