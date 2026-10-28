"""Keyword-based responder that works with no API key. Clearly labelled as demo mode."""

from __future__ import annotations

import re

from app.knowledge.candidate_profile import (
    CERTIFICATIONS,
    CORE_ANSWERS,
    EDUCATION,
    EXPERIENCE,
    PROJECTS,
    SKILLS,
)

_RULES: list[tuple[list[str], str]] = [
    (["life story", "about yourself", "introduce", "who are you", "background", "tell me about you"], "life_story"),
    (["superpower", "greatest strength", "best at", "number one strength"], "superpower"),
    (["grow", "growth", "improve", "develop", "weakness", "learn next"], "growth_areas"),
    (["misconception", "misunderstand", "coworkers think", "colleagues think", "wrong about you"], "misconception"),
    (["push", "boundar", "limits", "comfort zone", "challenge yourself"], "push_boundaries"),
    (["100x", "why us", "why this role", "why do you want", "join"], "why_100x"),
]


def _project_answer(name_hint: str | None) -> str:
    projects = PROJECTS
    if name_hint:
        projects = [p for p in PROJECTS if name_hint in p["name"].lower()] or PROJECTS
    p = projects[0]
    return (
        f"One project I'm happy to walk through is {p['name']}, built with "
        f"{', '.join(p['stack'])}. {p['details'][0]} {p['details'][1]} {p['details'][2]}"
    )


def demo_answer(message: str, history: list[dict] | None = None) -> str:
    q = message.lower()

    for keywords, key in _RULES:
        if any(k in q for k in keywords):
            return CORE_ANSWERS[key]

    if any(k in q for k in ["card91", "upi", "ppi", "payments", "gemini agent", "support agent"]):
        job = EXPERIENCE[0]
        return (
            f"At {job['company']} I was a {job['title']} from {job['period']}. "
            f"{job['highlights'][0]} {job['highlights'][3]}"
        )
    if re.search(r"\b(roc|auc|accuracy|f1|precision|recall|metrics?|scores?)\b", q):
        return (
            "The numbers I can stand behind: on the churn project, Logistic Regression reached an ROC-AUC of "
            "0.842 on the IBM Telco dataset, evaluated alongside Decision Tree and Random Forest with accuracy, "
            "precision, recall and F1. On the credit-risk project, LightGBM versus Logistic Regression gave a test "
            "ROC-AUC of 0.684, with out-of-time evaluation. I don't have other metrics in my profile beyond those."
        )
    if "churn" in q:
        return _project_answer("churn")
    if "credit" in q or "risk" in q or "lightgbm" in q or "shap" in q:
        return _project_answer("credit")
    if any(k in q for k in ["project", "built", "portfolio", "github"]):
        return (
            "Two projects I'd point to. "
            f"{PROJECTS[0]['name']}: {PROJECTS[0]['details'][2]} "
            f"{PROJECTS[1]['name']}: {PROJECTS[1]['details'][1]} "
            "Happy to go deeper on either one."
        )

    if any(k in q for k in ["dronagarden", "software engineer", "first job", "2024"]):
        job = EXPERIENCE[1]
        return (
            f"At {job['company']} I worked remotely as a {job['title']} from {job['period']}. "
            f"{job['highlights'][0]} {job['highlights'][1]}"
        )

    if any(
        k in q
        for k in [
            "rag",
            "graphrag",
            "retrieval",
            "langchain",
            "qdrant",
            "neo4j",
            "agent design",
            "ai agent",
            "design an agent",
        ]
    ):
        return (
            "My approach to RAG and agent design starts with the data: parse and chunk documents, embed "
            "them, and index into Qdrant for semantic search. For GraphRAG I add entity and relationship "
            "extraction into Neo4j so retrieval can combine vector similarity with graph traversal. I "
            "build the orchestration in LangChain, serve it through FastAPI, and insist on source-aware "
            "responses so every answer can be traced. At CARD91 that same pattern, grounded in client "
            "documentation on Gemini, cut support turnaround by about half."
        )

    if any(k in q for k in ["debug", "bug", "troubleshoot", "fix"]):
        return (
            "I debug by reproducing first, then narrowing. At Dronagarden I did a lot of debugging, "
            "testing and integration validation on Python API integrations. At CARD91 I validated REST "
            "APIs in Postman and ran SQL checks to find where data flows broke during UAT and "
            "production validation. I try to turn each fix into a test or a validation check so the "
            "same class of issue doesn't come back."
        )

    if any(k in q for k in ["new technolog", "learn", "pick up", "keep up"]):
        return (
            "I learn by building. When I wanted to understand retrieval systems I built RAG pipelines "
            "with LangChain and Qdrant, then pushed into GraphRAG with Neo4j and Cypher. I'm also doing "
            "an M.Tech in Data Science and AI at IIT Patna to strengthen the theory behind the tools, and "
            "I completed Google's Crash Course on Python early on. Reading docs, shipping a small "
            "version, then measuring it is my usual loop."
        )

    if any(k in q for k in ["skill", "stack", "technolog", "tools", "languages"]):
        groups = "; ".join(f"{g}: {', '.join(items[:4])}" for g, items in list(SKILLS.items())[:4])
        return f"My core stack, in short. {groups}. I'm strongest in Python, FastAPI, LangChain and retrieval systems."

    if any(
        k in q
        for k in [
            "education",
            "degree",
            "study",
            "college",
            "university",
            "iit",
            "m.tech",
            "mtech",
            "b.tech",
            "btech",
            "certif",
        ]
    ):
        edu = "; ".join(f"{e['degree']} at {e['institution']}, {e['period']}" for e in EDUCATION)
        return f"{edu}. Certification: {CERTIFICATIONS[0]}."

    if any(k in q for k in ["goal", "future", "5 years", "five years", "career", "aspir"]):
        return (
            "My goal is to become a strong Generative AI engineer who can take an idea from requirements "
            "to a production system. Near term that means going deeper on GraphRAG and agentic systems "
            "while completing my M.Tech at IIT Patna. Longer term I want to own AI products end to end "
            "and keep measuring them against real business outcomes, like I did with the support agent "
            "at CARD91."
        )

    if any(k in q for k in ["motivat", "drive", "why ai", "passion"]):
        return (
            "What motivates me is seeing a system I built remove real friction for people. The clearest "
            "example is the Gemini support agent at CARD91, which took a 24-hour wait down to about 12 "
            "hours. That feedback loop, build, measure, improve, is what keeps me in AI engineering."
        )

    if any(
        k in q
        for k in [
            "salary",
            "ctc",
            "compensation",
            "family",
            "married",
            "age",
            "hobby",
            "hobbies",
            "relationship",
            "religion",
            "phone",
            "email",
            "address",
        ]
    ):
        return (
            "That's not something covered in my profile here, so I'd rather not guess. I'm glad to "
            "talk about my work at CARD91, my RAG and GraphRAG projects, or my M.Tech at IIT Patna."
        )

    if re.search(r"\b(hi|hello|hey)\b", q) and len(q) < 30:
        return (
            "Hi, I'm Akshat's Personal AI Assistant. Ask me about my background, my work at CARD91, "
            "my projects, or how I like to grow."
        )

    return (
        "I want to be accurate rather than guess, and that isn't something my profile covers in detail. "
        "I can speak to my experience at CARD91 and Dronagarden, my churn-prediction and credit-risk "
        "projects, my RAG and GraphRAG work, or my education at IIT Patna. Which would be most useful?"
    )
