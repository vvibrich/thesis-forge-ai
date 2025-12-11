# ThesisForge AI

ThesisForge AI is an intelligent platform designed to assist students in writing their TCC (Trabalho de Conclusão de Curso) / Thesis. It leverages Google's Gemini AI to generate structured outlines, draft content, and ensure adherence to academic standards (ABNT).

## Features

-   **AI-Powered Structure:** Automatically generates a complete TCC outline (Introduction, Methodology, etc.) based on your topic and course.
-   **Smart Content Generation:** Drafts chapters with impersonal, formal academic language.
-   **ABNT Compliance:** Enforces Brazilian academic standards for formatting and citations.
-   **Project Management:** Dashboard to manage multiple thesis projects.
-   **Rich Text Editor:** Full-featured editor with support for saving and exporting.
-   **Plagiarism Check:** Integrated tool to verify content originality.
-   **Authentication:** Secure login and registration via Supabase.

## Tech Stack

-   **Frontend:** React, Vite, TypeScript, Tailwind CSS
-   **Backend / Database:** Supabase (PostgreSQL, Auth)
-   **AI Engine:** Google Gemini 2.0 Flash
-   **Icons:** Lucide React

## Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   A Supabase account
-   A Google AI Studio API Key

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd thesis-forge-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    API_KEY=your_google_gemini_api_key
    ```

4.  **Database Setup (Supabase):**
    Run the following SQL in your Supabase SQL Editor to create the `projects` table and policies:

    ```sql
    create table projects (
      id uuid default gen_random_uuid() primary key,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
      title text,
      content jsonb,
      user_id uuid references auth.users not null
    );

    alter table projects enable row level security;

    create policy "Users can create their own projects"
      on projects for insert
      with check (auth.uid() = user_id);

    create policy "Users can view their own projects"
      on projects for select
      using (auth.uid() = user_id);

    create policy "Users can update their own projects"
      on projects for update
      using (auth.uid() = user_id);

    create policy "Users can delete their own projects"
      on projects for delete
      using (auth.uid() = user_id);
    ```

5.  **Run the application:**
    ```bash
    npm run dev
    ```

## Usage

1.  Register a new account.
2.  Go to the Dashboard and click "Novo TCC".
3.  Enter your topic, course, and objectives.
4.  The AI will generate a structure. Click on a chapter to open the editor.
5.  Use the "Gerar com IA" button to draft content for specific sections.

## License

© 2025 ThesisForge AI. All rights reserved.
