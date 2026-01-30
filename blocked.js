// Inspirational quotes about freedom and discipline
const quotes = [
  {
    text: "The secret of freedom lies in educating people, whereas the secret of tyranny is in keeping them ignorant.",
    author: "Maximilien Robespierre"
  },
  {
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn"
  },
  {
    text: "Freedom is not the absence of commitments, but the ability to choose.",
    author: "Paulo Coelho"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss"
  }
];

// Display a random quote
const quote = quotes[Math.floor(Math.random() * quotes.length)];
document.querySelector('.quote p').textContent = `"${quote.text}"`;
document.querySelector('.quote .author').textContent = `— ${quote.author}`;
