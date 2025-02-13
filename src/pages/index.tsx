import { useEffect, useState } from "react";

interface Flashcard {
  question: string;
  answer: string;
}

const gridSize = 5; // 5x5 grid

export default function Home() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  async function fetchFlashcards(): Promise<void> {
    try {
      const response = await fetch("http://localhost:5000/flashcards");
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }
      const data: Flashcard[] = await response.json();
      setFlashcards(data);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    }
  }

  function renderFlashcards(): JSX.Element[] {
    const startIndex = currentSetIndex * gridSize * gridSize;
    const endIndex = startIndex + gridSize * gridSize;

    return flashcards.slice(startIndex, endIndex).map((card, index) => (
      <div key={index} className="flashcard-container">
        <div className="flashcard" onClick={(e) => flipCard(e.currentTarget)}>
          <div className="flashcard-front">{card.question}</div>
          <div className="flashcard-back">{card.answer}</div>
        </div>
      </div>
    ));
  }

  function flipCard(card: HTMLElement): void {
    card.classList.toggle("flipped");
  }

  function prevSet(): void {
    if (currentSetIndex > 0) {
      setCurrentSetIndex((prev) => prev - 1);
    }
  }

  function nextSet(): void {
    if (currentSetIndex < Math.ceil(flashcards.length / (gridSize * gridSize)) - 1) {
      setCurrentSetIndex((prev) => prev + 1);
    }
  }

  async function addFlashcard(): Promise<void> {
    const questionInput = document.getElementById("questionInput") as HTMLInputElement;
    const answerInput = document.getElementById("answerInput") as HTMLInputElement;

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) {
      alert("Please enter both a question and an answer.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) {
        throw new Error("Failed to add flashcard");
      }

      questionInput.value = "";
      answerInput.value = "";

      await fetchFlashcards();
    } catch (error) {
      console.error("Error adding flashcard:", error);
    }
  }

  return (
    <div>
      <div className="flashcards-grid">{renderFlashcards()}</div>

      <div className="navigation">
        <button onClick={prevSet} disabled={currentSetIndex === 0}>
          Previous
        </button>
        <button
          onClick={nextSet}
          disabled={currentSetIndex === Math.ceil(flashcards.length / (gridSize * gridSize)) - 1}
        >
          Next
        </button>
      </div>

      <div className="add-flashcard-form">
        <h2>Add a New Flashcard</h2>
        <input type="text" id="questionInput" placeholder="Enter question" required />
        <input type="text" id="answerInput" placeholder="Enter answer" required />
        <button onClick={addFlashcard}>Add Flashcard</button>
      </div>
    </div>
  );
}
