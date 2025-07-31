# Smooth Read

A modern web application that enhances reading comprehension by automatically highlighting professional terms and providing instant explanations on hover.

## Features

- **Smart Term Detection**: Automatically identifies and highlights professional terms from finance, technology, legal, medical, and business domains
- **Interactive Tooltips**: Hover over highlighted terms to see detailed definitions and examples
- **Beautiful UI**: Modern, responsive design with smooth animations and intuitive user experience
- **File Upload Support**: Upload text files or paste content directly
- **Sample Content**: Try the app with built-in sample text containing various professional terms

## Supported Term Categories

- **Finance**: P/E ratio, EBITDA, ROI, CAPEX, EBIT, DCF, IPO, M&A
- **Technology**: API, SDK, UI/UX, SaaS, MVP, DevOps, Machine Learning, Blockchain
- **Legal**: NDA, IP, Force Majeure, Due Diligence, Liability
- **Medical**: MRI, CT Scan, EKG, Biopsy, Symptom
- **Business**: KPI, B2B, B2C, Market Share, Revenue

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smooth-read.git
cd smooth-read
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Usage

1. **Input Content**: Paste your text or upload a file containing professional content
2. **Start Reading**: Click "Start Reading" to process your content
3. **Hover for Definitions**: Hover over highlighted terms to see explanations
4. **View Statistics**: See how many terms were detected and their categories

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Development**: ESLint for code quality

## Project Structure

```
smooth-read/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx      # Application header
│   │   ├── TextInput.tsx   # Content input interface
│   │   ├── Reader.tsx      # Main reading interface
│   │   └── TermTooltip.tsx # Term definition tooltips
│   ├── data/
│   │   └── termDictionary.ts # Professional terms database
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md              # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Browser extension for highlighting terms on any website
- [ ] PDF parsing and highlighting
- [ ] Custom term dictionary management
- [ ] Export highlighted content with annotations
- [ ] Multi-language support
- [ ] Advanced term detection using AI/ML
- [ ] User accounts and personalized term lists

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies for optimal performance and user experience
- Designed with accessibility and usability in mind
- Inspired by the need for better reading comprehension tools in professional environments