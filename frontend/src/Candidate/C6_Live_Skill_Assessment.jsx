import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../Components/PrimaryButton";

const C6_Live_Skill_Assessment = () => {
    const navigate = useNavigate();

    const TOTAL_QUESTIONS = 5;

    const [assessment, setAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [timeLeft, setTimeLeft] = useState(0);
    const [assessmentExpired, setAssessmentExpired] = useState(false);
    const [answers, setAnswers] = useState({});
    const [reported, setReported] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAssessment = async () => {
            try {
                setLoading(true);
                setError("");

                const storedAssessment = sessionStorage.getItem(
                    "currentSkillAssessment"
                );

                if (!storedAssessment) {
                    throw new Error(
                        "No active assessment was found. Please select a skill again."
                    );
                }

                const parsedAssessment = JSON.parse(storedAssessment);

                if (
                    !parsedAssessment.skillId ||
                    !parsedAssessment.attemptId
                ) {
                    throw new Error(
                        "Assessment information is incomplete."
                    );
                }

                setAssessment(parsedAssessment);

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:5000/api/candidates/me/skills/${parsedAssessment.skillId}/verify`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        data.error ||
                        "Failed to load assessment"
                    );
                }

                const backendQuestions = data.data.questions || [];

                if (backendQuestions.length !== TOTAL_QUESTIONS) {
                    throw new Error(
                        "The assessment does not contain the expected number of questions."
                    );
                }
                const attempt = data.data.attempt;

                if (!attempt) {
                    throw new Error("Assessment attempt was not found");
                }

                if (attempt.status === "Expired") {
                    setAssessmentExpired(true);
                    throw new Error(
                        "This assessment has expired. Please return to the assessment page and start a new attempt."
                    );
                }

                if (attempt.status === "Completed") {
                    throw new Error(
                        "This assessment has already been completed."
                    );
                }

                if (attempt.status !== "Started") {
                    throw new Error(
                        "This assessment has not been started yet."
                    );
                }

                if (!attempt.started_at) {
                    throw new Error(
                        "Assessment start time is unavailable."
                    );
                }

                const ASSESSMENT_TIME_LIMIT_SECONDS = 35 * 60;

                const startedAt = new Date(attempt.started_at).getTime();

                const elapsedSeconds = Math.floor(
                    (Date.now() - startedAt) / 1000
                );

                const remainingSeconds = Math.max(
                    0,
                    ASSESSMENT_TIME_LIMIT_SECONDS - elapsedSeconds
                );

                setTimeLeft(remainingSeconds);

                if (remainingSeconds <= 0) {
                    setAssessmentExpired(true);
                    throw new Error(
                        "Your assessment time has expired."
                    );
                }
                setQuestions(backendQuestions);
            } catch (err) {
                console.error("Failed to load assessment:", err);
                setError(
                    err.message ||
                    "Failed to load assessment"
                );
            } finally {
                setLoading(false);
            }
        };

        loadAssessment();
    }, []);
    const question = questions[currentQuestion - 1];

    /* TIMER */
    useEffect(() => {
        if (loading || assessmentExpired || timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((previous) => {
                if (previous <= 1) {
                    setAssessmentExpired(true);
                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, assessmentExpired]);

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");

    const progress = (currentQuestion / TOTAL_QUESTIONS) * 100;

    const answeredCount = Object.keys(answers).length;

    const handleAnswer = (value) => {
        if (assessmentExpired || timeLeft <= 0) {
            return;
        }

        setAnswers((previous) => ({
            ...previous,
            [currentQuestion]: value,
        }));
    };

    const nextQuestion = () => {
        if (currentQuestion < TOTAL_QUESTIONS) {
            setCurrentQuestion((previous) => previous + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestion > 1) {
            setCurrentQuestion((previous) => previous - 1);
        }
    };

    const handleReport = () => {
        setReported(true);

        setTimeout(() => {
            setReported(false);
        }, 2500);
    };

    const handleSubmit = async () => {
        if (!assessment || assessmentExpired || timeLeft <= 0) {
            return;
        }

        const unansweredQuestions = questions.filter(
            (_, index) => !answers[index + 1]
        );

        if (unansweredQuestions.length > 0) {
            setError(
                "Please answer all questions before submitting."
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const token = localStorage.getItem("token");

            const formattedAnswers = questions.map(
                (item, index) => ({
                    question_number: item.question_number,
                    selected_option: answers[index + 1],
                })
            );

            const response = await fetch(
                `http://localhost:5000/api/candidates/me/skills/${assessment.skillId}/verify/attempts/${assessment.attemptId}/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        answers: formattedAnswers,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to submit assessment"
                );
            }

            sessionStorage.setItem(
                "assessmentResult",
                JSON.stringify(data.data)
            );

            navigate("/candidate/assessment-result");
        } catch (err) {
            console.error(
                "Failed to submit assessment:",
                err
            );

            setError(
                err.message ||
                "Failed to submit assessment"
            );
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <section className="min-h-screen pt-6 px-8 pb-10 bg-slate-50">
            <div className="w-full max-w-7xl mx-auto">

                {/* TOP BAR */}
                <div className="flex items-center justify-between gap-5 py-3.5 px-4 border border-slate-200 rounded-2xl bg-white shadow-sm mb-5">

                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 flex-shrink-0 grid place-items-center rounded-xl text-white bg-gradient-to-br from-blue-600 to-indigo-500">
                            <i className="fa-solid fa-flask" />
                        </div>

                        <div>
                            <strong className="block text-sm">Skill Verification Assessment</strong>
                            <span className="block mt-1 text-slate-500 text-xs">
                                {assessment?.skillName || "Skill Verification"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 py-2 px-2.5 rounded-full bg-red-50 text-red-600 text-xs font-extrabold tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                            LIVE
                        </div>

                        <div className="inline-flex items-center gap-2 py-2 px-3 rounded-lg bg-red-50 text-red-600 font-mono text-sm font-extrabold">
                            <i className="fa-regular fa-clock" />
                            {minutes}:{seconds}
                        </div>

                        <button type="button" className="btn btn-outline btn-sm" onClick={handleReport}>
                            <i className="fa-solid fa-flag" />
                            Report issue
                        </button>
                    </div>
                </div>

                {/* LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">

                    {/* MAIN */}
                    <main className="lg:col-span-3 min-w-0">

                        {/* PROGRESS */}
                        <div className="py-4 px-5 border border-slate-200 rounded-2xl bg-white mb-4">
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="py-1.5 px-2.5 rounded-lg bg-indigo-50 text-blue-600 text-xs font-extrabold">
                                        Question {currentQuestion} of {TOTAL_QUESTIONS}
                                    </span>

                                    <span className="text-slate-500 text-xs">{answeredCount} answered</span>
                                </div>

                                <span className="text-slate-500 text-sm">
                                    5 assessment questions
                                </span>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* QUESTION */}
                        <div className="min-h-96 p-7 border border-slate-200 rounded-3xl bg-white shadow-lg">

                            {question ? (
                                <>
                                    <div className="inline-flex items-center gap-2 py-2 px-2.5 rounded-full bg-blue-50 text-blue-600 text-xs font-extrabold tracking-wide uppercase">
                                        <i
                                            className={
                                                question.question_type === "coding"
                                                    ? "fa-solid fa-code"
                                                    : "fa-solid fa-triangle-exclamation"
                                            }
                                        />
                                        {question.question_type === "coding"
                                            ? "Coding / Practical"
                                            : "Scenario Based"}
                                    </div>

                                    <h1 className="max-w-4xl mt-5 mb-2.5 text-2xl leading-normal font-extrabold">
                                        {question.question_text}
                                    </h1>

                                    {question.description && (
                                        <p className="max-w-4xl m-0 text-slate-500 text-sm leading-relaxed">
                                            {question.description}
                                        </p>
                                    )}

                                    {/* MULTIPLE CHOICE */}
                                    {question.options && question.options.length > 0 && (
                                        <div className="mt-7">
                                            <span className="block mb-2.5 text-xs font-extrabold">
                                                Select your answer
                                            </span>

                                            <div className="grid gap-2.5">
                                                {question.options.map((option, index) => {
                                                    const selected = answers[currentQuestion] === option;

                                                    return (
                                                        <label
                                                            key={index}
                                                            className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition ${selected
                                                                ? "border-blue-500 bg-blue-50"
                                                                : "border-slate-200 hover:border-blue-500 hover:bg-blue-50"
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${currentQuestion}`}
                                                                checked={selected}
                                                                onChange={() => handleAnswer(option)}
                                                                className="accent-blue-600"
                                                            />
                                                            <span className="text-xs">{option}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* TEXT / CODING */}
                                    {!question.options?.length && (
                                        <div className="mt-7">
                                            <label className="block mb-2.5 text-xs font-extrabold">
                                                Your response
                                            </label>

                                            <textarea
                                                className="w-full min-h-44 resize-y p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-sans text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                value={answers[currentQuestion] || ""}
                                                onChange={(event) => handleAnswer(event.target.value)}
                                                placeholder={
                                                    question.question_type === "coding"
                                                        ? "Write your solution or implementation here..."
                                                        : "Explain your approach and reasoning here..."
                                                }
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* BACKEND-READY EMPTY STATE */
                                <div className="min-h-64 flex items-center justify-center text-center">
                                    <div className="min-h-64 flex items-center justify-center text-center">
                                        <div className="max-w-lg">
                                            <div className="w-14 h-14 mx-auto mb-4 grid place-items-center rounded-2xl bg-indigo-50 text-blue-600 text-2xl">
                                                <i className="fa-solid fa-circle-info" />
                                            </div>

                                            <h2 className="mb-2 text-lg font-extrabold">
                                                Assessment unavailable
                                            </h2>

                                            <p className="m-0 text-slate-500 text-xs leading-relaxed">
                                                {error || "The assessment questions could not be loaded."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* NAVIGATION */}
                        <div className="flex items-center justify-between gap-4 mt-4">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap bg-white text-gray-600 hover:text-[#334155] cursor-pointer"
                                    onClick={previousQuestion}
                                >
                                    <i className="fa-solid fa-arrow-left" />
                                    Previous Question
                                </button>

                                {currentQuestion < TOTAL_QUESTIONS && (
                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap bg-white text-gray-600 hover:text-[#334155] cursor-pointer"
                                        onClick={nextQuestion}
                                    >
                                        Next Question
                                        <i className="fa-solid fa-arrow-right" />
                                    </button>
                                )}
                            </div>

                            {currentQuestion === TOTAL_QUESTIONS && (
                                <PrimaryButton
                                    onClick={handleSubmit}
                                    disabled={assessmentExpired || timeLeft <= 0}
                                >
                                    Submit Assessment
                                </PrimaryButton>
                            )}
                        </div>
                    </main>

                    {/* SIDEBAR */}
                    <aside className="grid gap-4">

                        {/* QUESTION NAVIGATOR */}
                        <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-2.5 mb-4">
                                <strong className="text-sm">Question navigator</strong>
                                <span className="text-slate-500 text-xs">
                                    {answeredCount}/{TOTAL_QUESTIONS}
                                </span>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
                                    const number = index + 1;
                                    const isCurrent = number === currentQuestion;
                                    const isAnswered = Boolean(answers[number]);

                                    const numberClasses = isCurrent
                                        ? "border-blue-500 bg-blue-600 text-white"
                                        : isAnswered
                                            ? "bg-green-50 border-green-200 text-green-600"
                                            : "border-slate-200 bg-slate-50 text-slate-500";

                                    return (
                                        <button
                                            type="button"
                                            key={number}
                                            className={`w-full aspect-square grid place-items-center border rounded-lg cursor-pointer text-xs font-bold ${numberClasses}`}
                                            onClick={() => setCurrentQuestion(number)}
                                        >
                                            {number}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ASSESSMENT STATUS */}
                        {/* ASSESSMENT STATUS */}
                        <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
                            <div className="mb-4">
                                <strong className="text-sm">Assessment status</strong>
                            </div>

                            <div className="grid gap-3">

                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 grid place-items-center rounded-lg bg-indigo-50 text-blue-600 text-xs">
                                        <i className="fa-solid fa-circle-play" />
                                    </div>

                                    <div>
                                        <strong className="block text-xs">
                                            Assessment active
                                        </strong>

                                        <span className="block mt-0.5 text-slate-500 text-xs">
                                            Your assessment is currently in progress
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 grid place-items-center rounded-lg bg-indigo-50 text-blue-600 text-xs">
                                        <i className="fa-solid fa-shield-halved" />
                                    </div>

                                    <div>
                                        <strong className="block text-xs">
                                            Secure evaluation
                                        </strong>

                                        <span className="block mt-0.5 text-slate-500 text-xs">
                                            Your answers are evaluated securely by the assessment system
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 grid place-items-center rounded-lg bg-indigo-50 text-blue-600 text-xs">
                                        <i className="fa-solid fa-clock" />
                                    </div>

                                    <div>
                                        <strong className="block text-xs">
                                            Time remaining
                                        </strong>

                                        <span className="block mt-0.5 text-slate-500 text-xs">
                                            {assessmentExpired
                                                ? "Time expired"
                                                : `${minutes}:${seconds}`}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* INTEGRITY */}
                        <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 text-green-600 text-xs leading-relaxed">
                                <i className="fa-solid fa-shield-halved" />
                                <div>
                                    <strong className="block text-xs">Integrity protected</strong>
                                    <span className="block mt-0.5 text-slate-500">
                                        Your assessment activity is being monitored
                                        according to the verification rules.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* STRUCTURE */}
                        {/* QUESTION STRUCTURE */}
                        <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">

                            <div className="mb-4">
                                <strong className="text-sm">
                                    Question structure
                                </strong>
                            </div>

                            <div className="flex items-center gap-2.5">

                                <div className="w-7 h-7 grid place-items-center rounded-lg bg-indigo-50 text-blue-600 text-xs">
                                    <i className="fa-solid fa-list-ol" />
                                </div>

                                <div>
                                    <strong className="block text-xs">
                                        5 assessment questions
                                    </strong>

                                    <span className="block mt-0.5 text-slate-500 text-xs">
                                        Skill-focused scenario questions
                                    </span>
                                </div>

                            </div>

                        </div>
                    </aside>
                </div>
            </div>

            {/* REPORT MESSAGE */}
            {reported && (
                <div className="fixed right-6 bottom-6 z-50 py-3 px-4 rounded-xl bg-blue-950 text-white text-xs shadow-2xl">
                    <i className="fa-solid fa-circle-check" />
                    &nbsp; Issue report recorded for review.
                </div>
            )}
        </section>
    );
};

export default C6_Live_Skill_Assessment;