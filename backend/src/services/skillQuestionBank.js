const questionBank = {
  5: [
    {
      question_text:
        "You have a React component that receives a user object as a prop. The component should display the user's name, but sometimes the name is missing. What is the safest approach?",
      description:
        "Choose the approach that prevents the component from crashing when the name is unavailable.",
      options: [
        "Use optional chaining such as user?.name",
        "Call user.name repeatedly until it works",
        "Remove the user object from the component",
        "Use document.getElementById() to find the name"
      ],
      correct_option:
        "Use optional chaining such as user?.name"
    },

    {
      question_text:
        "A React component needs to store a counter value that changes when the user clicks a button. Which approach should you use?",
      description:
        "Consider how React should handle data that changes and needs to trigger a re-render.",
      options: [
        "Use useState",
        "Use a normal local variable",
        "Use console.log",
        "Use document.write"
      ],
      correct_option:
        "Use useState"
    },

    {
      question_text:
        "You have a list of users that you render with map(). React displays a warning about missing keys. What should you do?",
      description:
        "Choose the appropriate way to identify items in a rendered list.",
      options: [
        "Give each list item a stable unique key",
        "Remove map() from the component",
        "Use the same key for every item",
        "Ignore the warning because keys are unnecessary"
      ],
      correct_option:
        "Give each list item a stable unique key"
    },

    {
      question_text:
        "A React component needs to fetch data from an API when the component first appears on the screen. Which React hook is normally appropriate for this side effect?",
      description:
        "Choose the hook designed for handling side effects such as API requests.",
      options: [
        "useEffect",
        "useState",
        "useMemo",
        "useRef"
      ],
      correct_option:
        "useEffect"
    },

    {
      question_text:
        "A parent component needs to send a value to one of its child components. What is the standard React approach?",
      description:
        "Consider the normal direction of data flow in React.",
      options: [
        "Pass the value as a prop",
        "Modify the child's HTML directly",
        "Use document.querySelector()",
        "Store the value in the browser URL"
      ],
      correct_option:
        "Pass the value as a prop"
    }
  ]
};

const getQuestionsForSkill = (skillId) => {
  const questions = questionBank[skillId];

  if (!questions) {
    return null;
  }

  return questions.map((question) => ({
    ...question,
    options: [...question.options]
  }));
};

module.exports = {
  getQuestionsForSkill,
};