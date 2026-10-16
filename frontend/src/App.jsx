import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./Pages/Login"
import C2_Candidate_Dashboard from "./Candidate/C2_Candidate_Dashboard"
import C1_Profile_Setup from "./Candidate/C1_Profile_Setup"
import C3_Skill_Selection from "./Candidate/C3_Skill_Selection"
import Register from "./Pages/Register"
import C4_Skill_Level_Selection from "./Candidate/C4_Skill_Level_Selection"
import C5_Assessment_Instructions from "./Candidate/C5_Assessment_Instruction"
import C6_Live_Skill_Assessment from "./Candidate/C6_Live_Skill_Assessment"
import C7_Assessment_Result from "./Candidate/C7_Assessment_Result"
import C9_Jobs_Internships from "./Candidate/C9_Jobs_Internships"
import C10_Job_Details from "./Candidate/C10_Job_Details";
import C11_Apply_Confirmation from "./Candidate/C11_Apply_Confirmation";
import C12_Job_Specific_Assessment from "./Candidate/C12_Job_Specific_Assessment";
import C13_Eligibility_Result from "./Candidate/C13_Eligibility_Result";
import C14_My_Applications from "./Candidate/C14_My_Applications";
import HR_Login from "./HR/HR_Login";
import HR_Register from "./HR/HR_Register";
import R2_Recruiter_Dashboard from "./HR/R2_Recruiter_Dashboard"
import R3_Jobs_List from "./HR/R3_Jobs_List"
import R4_Create_Job_Basic_Details from "./HR/R4_Create_Job_Basic_Details"
import R5_Create_Job_Responsibilities from "./HR/R5_Create_Job_Responsibilities"
import R6_Create_Job_Required_Skills from "./HR/R6_Create_Job_Required_Skills";
import R7_Assessment_Setup from "./HR/R7_Assessment_Setup";
import R10_Manual_Question_Entry from "./HR/R10_Manual_Question_Entry";
import R11_Assessment_Preview_Publish from "./HR/R11_Assessment_Preview_Publish";
import R12_Applications from "./HR/R12_Applications";


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>

          // Candidate Routes

          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/candidate-profile-setup" element={<C1_Profile_Setup />} />
          <Route path="/candidate-dashboard" element={<C2_Candidate_Dashboard />} />
          <Route path="/candidate/skills" element={<C3_Skill_Selection />} />
          <Route path="/candidate/skills/selection" element={<C4_Skill_Level_Selection />} />
          <Route path="/candidate/skills/assessment-instruction" element={<C5_Assessment_Instructions />} />
          <Route path="/candidate/skill-assessment" element={<C6_Live_Skill_Assessment />} />
          <Route path="/candidate/assessment-result" element={<C7_Assessment_Result />} />
          <Route path="/candidate/jobs" element={<C9_Jobs_Internships />} />
          <Route path="/candidate/job-details" element={<C10_Job_Details />} />
          <Route path="/candidate/apply" element={<C11_Apply_Confirmation />} />
          <Route path="/candidate/job-assessment" element={<C12_Job_Specific_Assessment />} />
          <Route path="/candidate/eligibility" element={<C13_Eligibility_Result />} />
          <Route path="/candidate/applications" element={<C14_My_Applications />} />

          // HR/Recruiter Routes

          <Route path="/hr/login" element={<HR_Login />} />
          <Route path="/hr/register" element={<HR_Register />} />

          <Route path="/hr/dashboard" element={<R2_Recruiter_Dashboard />} />
          <Route path="/hr/jobs" element={<R3_Jobs_List />} />
          <Route path="/hr/create-job" element={<R4_Create_Job_Basic_Details />} />
          <Route path="/hr/create-job/responsibilities" element={<R5_Create_Job_Responsibilities />} />
          <Route path="/hr/create-job/skills" element={<R6_Create_Job_Required_Skills />} />
          <Route path="/hr/assessment-setup" element={<R7_Assessment_Setup />} />
          <Route path="/hr/manual-questions" element={<R10_Manual_Question_Entry />} />
          <Route path="/hr/question-review" element={<R11_Assessment_Preview_Publish />} />
          <Route path="/hr/applications" element={<R12_Applications />} />


        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
