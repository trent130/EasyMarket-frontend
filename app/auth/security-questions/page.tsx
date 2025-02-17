"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { checkPasswordStrength, PasswordStrengthResult } from '../../utils/passwordStrength';
import { checkSecurityQuestions, SecurityQuestion, submitSecurityQuestions } from './actions';

const SECURITY_QUESTIONS = [
    "What was the name of your first pet?",
    "In what city were you born?",
    "What is your mother's maiden name?",
    "What high school did you attend?",
    "What was the make of your first car?",
    "What is your favorite movie?",
];

/**
 * Page to set up security questions for a user.
 *
 * This page allows an authenticated user to set up security questions and
 * answers for their account. The user is presented with a form containing three
 * questions and answer fields. The user can select a question from a list of
 * predefined questions and enter an answer for that question. If the user has
 * already set up their security questions, they are informed of this and no form
 * is presented.
 *
 * After the user submits the form, the security questions and answers are
 * validated and stored in the database. If the validation fails, an error
 * message is displayed to the user. If the validation succeeds, the user is
 * informed of the success and the page is rendered again with a success message.
 */

export default function SecurityQuestions() {
    const [questions, setQuestions] = useState(['', '', '']);
    const [answers, setAnswers] = useState(['', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const checkExistingQuestions = async () => {
        try {
            // This function needs to be run on the server side
            const data = await checkSecurityQuestions();
            if ("hasSecurityQuestions" in data) {
              setSuccess('You have already set up your security questions.');
            } else {
                setError(data.error)
            }
        } catch (error) {
            setError('Failed to get security questions.');
        }
    };

    /**
     * Handles the form submission by sending the security questions and answers
     * to the server to be stored. If the user has not filled in all questions and
     * answers, an error is displayed. If the request to the server fails, an
     * error is displayed. If the request succeeds, a success message is
     * displayed.
     *
     * @param {React.FormEvent} e - The form event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (questions.some(q => !q) || answers.some(a => !a)) {
            setError('Please fill in all questions and answers');
            return;
        }

        try {
            const securityQuestions: SecurityQuestion[] = questions.map((question, index) => ({
                question,
                answer: answers[index],
            }));
            const result = await submitSecurityQuestions(securityQuestions);
            if ("message" in result) {
                setSuccess(result.message);
            } else {
                setError(result.error)
            }

        } catch (error) {
            setError('Failed to submit questions.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Set Up Security Questions</h1>
            {success ? (
                <p className="text-green-500">{success}</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {[0, 1, 2].map((index) => (
                        <div key={index}>
                            <select aria-label="Select a question"
                                value={questions[index]}
                                onChange={(e) => setQuestions(questions.map((q, i) => i === index ? e.target.value : q))}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select a question</option>
                                {SECURITY_QUESTIONS.map((q) => (
                                    <option key={q} value={q}>
                                        {q}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={answers[index]}
                                onChange={(e) => setAnswers(answers.map((a, i) => i === index ? e.target.value : a))}
                                placeholder="Your answer"
                                className="w-full mt-2 p-2 border rounded"
                            />
                        </div>
                    ))}
                    {error && <p className="text-red-500">{error}</p>}
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        Set Security Questions
                    </button>
                </form>
            )}
        </div>
    );
}