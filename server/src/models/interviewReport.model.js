import mongoose from "mongoose";

/**
 * Technical Questions Sub-schema
 */
const technicalQuestionsSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Technical question is required"]
    },
    intention: {
      type: String,
      required: [true, "Intention is required"]
    },
    answer: {
      type: String,
      required: [true, "Answer is required"]
    }
  },
  { _id: false }
);

/**
 * Behavioral Questions Sub-schema
 */
const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Behavioral question is required"]
    },
    intention: {
      type: String,
      required: [true, "Intention is required"]
    },
    answer: {
      type: String,
      required: [true, "Answer is required"]
    }
  },
  { _id: false }
);

/**
 * Skill Gap Analysis Sub-schema
 */
const skillGapSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, "Skill is required"]
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Severity is required"]
    }
  },
  { _id: false }
);

/**
 * Day-wise Preparation Plan Sub-schema
 */
const preparationPlanSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, "Day is required"]
    },
    focus: {
      type: String,
      required: [true, "Focus is required"]
    },
    task: [
      {
        type: String,
        required: [true, "Task is required"]
      }
    ]
  },
  { _id: false }
);

/**
 * InterviewReport Mongoose Schema representing AI-generated interview preparation strategy & questions.
 */
const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job description required"]
    },
    resume: {
      type: String
    },
    selfDescription: {
      type: String
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    technicalQuestions: [technicalQuestionsSchema],
    behavioralQuestion: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: [true, "Title is required"]
    }
  },
  { timestamps: true }
);

export const interviewReportModel = mongoose.models.InterviewReport || mongoose.model("InterviewReport", interviewReportSchema);