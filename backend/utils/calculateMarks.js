const Question = require("../models/questionModel");

const calculateMarks = async (examId, answers) => {
    const questions = await Question.find({ exam: examId });

    let score = 0;
    let totalMarks = 0;

    for (const question of questions) {
        totalMarks += question.marks;
        const submitted = answers.find(
            (a) => a.question.toString() === question._id.toString()
        );
        if (
            submitted &&
            submitted.selectedOption !== null &&
            submitted.selectedOption === question.correctOption
        ) {
            score += question.marks;
        }
    }

    const percentage =
        totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    return { score, totalMarks, percentage };
};

module.exports = calculateMarks;