import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../Components/BackButton";
import PrimaryButton from "../Components/PrimaryButton";
import apiRequest from "../services/api";

const C1_Profile_Setup = () => {
    const navigate = useNavigate();

    const photoInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        headline: "",
        country: "",
        state: "",
        city: "",
        phone: "",
        bio: "",
        linkedin: "",
        github: "",
        website: "",
    });

    const [originalEducationIds, setOriginalEducationIds] = useState([]);
    const [originalProjectIds, setOriginalProjectIds] = useState([]);
    const [originalInternshipIds, setOriginalInternshipIds] = useState([]);
    const [originalWorkExperienceIds, setOriginalWorkExperienceIds] = useState([]);
    const [workExperienceList, setWorkExperienceList] = useState([
        {
            id: null,
            companyName: "",
            role: "",
            description: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
            location: "",
            workSetting: "",
            technologiesUsed: "",
            certificateUrl: "",
            workExperienceUrl: "",
        },
    ]);
    const [projectList, setProjectList] = useState([
        {
            id: null,
            projectName: "",
            description: "",
            role: "",
            technologiesUsed: "",
            startDate: "",
            endDate: "",
            projectUrl: "",
            teamSize: "",
            isAcademicProject: false,
        },
    ]);
    const [educationList, setEducationList] = useState([
        {
            id: null,
            educationLevel: "",
            degreeName: "",
            institutionName: "",
            startDate: "",
            endDate: "",
            score: "",
            scoreType: "CGPA",
        },
    ]);
    const [internshipList, setInternshipList] = useState([
        {
            id: null,
            companyName: "",
            role: "",
            description: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
            location: "",
            workSetting: "",
            technologiesUsed: "",
            certificateUrl: "",
            internshipUrl: "",
        },
    ]);
    const updateEducation = (index, field, value) => {
        setEducationList((previous) =>
            previous.map((education, educationIndex) =>
                educationIndex === index
                    ? {
                        ...education,
                        [field]: value,
                    }
                    : education
            )
        );

        setSaved(false);
    };
    const addEducation = () => {
        setEducationList((previous) => [
            ...previous,
            {
                id: null,
                educationLevel: "",
                degreeName: "",
                institutionName: "",
                startDate: "",
                endDate: "",
                score: "",
                scoreType: "CGPA",
            },
        ]);
    };
    const removeEducation = (index) => {
        setEducationList((previous) =>
            previous.filter(
                (_, educationIndex) => educationIndex !== index
            )
        );

        setSaved(false);
    };
    const updateProject = (index, field, value) => {
        setProjectList((previous) =>
            previous.map((project, projectIndex) =>
                projectIndex === index
                    ? {
                        ...project,
                        [field]: value,
                    }
                    : project
            )
        );

        setSaved(false);
    };


    const addProject = () => {
        setProjectList((previous) => [
            ...previous,
            {
                id: null,
                projectName: "",
                description: "",
                role: "",
                technologiesUsed: "",
                startDate: "",
                endDate: "",
                projectUrl: "",
                teamSize: "",
                isAcademicProject: false,
            },
        ]);
    };


    const removeProject = (index) => {
        setProjectList((previous) =>
            previous.filter(
                (_, projectIndex) => projectIndex !== index
            )
        );

        setSaved(false);
    };
    const [photo, setPhoto] = useState(null);
    const [resume, setResume] = useState(null);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [showOptionalSections, setShowOptionalSections] = useState(false);
    const updateField = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
        setSaved(false);
    };
    const updateInternship = (index, field, value) => {
        setInternshipList((previous) =>
            previous.map((internship, internshipIndex) =>
                internshipIndex === index
                    ? {
                        ...internship,
                        [field]: value,
                    }
                    : internship
            )
        );

        setSaved(false);
    };


    const addInternship = () => {
        setInternshipList((previous) => [
            ...previous,
            {
                id: null,
                companyName: "",
                role: "",
                description: "",
                startDate: "",
                endDate: "",
                isCurrent: false,
                location: "",
                workSetting: "",
                technologiesUsed: "",
                certificateUrl: "",
                internshipUrl: "",
            },
        ]);
    };


    const removeInternship = (index) => {
        setInternshipList((previous) =>
            previous.filter(
                (_, internshipIndex) =>
                    internshipIndex !== index
            )
        );

        setSaved(false);
    };
    const updateWorkExperience = (index, field, value) => {
        setWorkExperienceList((previous) =>
            previous.map((experience, experienceIndex) =>
                experienceIndex === index
                    ? {
                        ...experience,
                        [field]: value,
                    }
                    : experience
            )
        );

        setSaved(false);
    };

    const addWorkExperience = () => {
        setWorkExperienceList((previous) => [
            ...previous,
            {
                id: null,
                companyName: "",
                role: "",
                description: "",
                startDate: "",
                endDate: "",
                isCurrent: false,
                location: "",
                workSetting: "",
                technologiesUsed: "",
                certificateUrl: "",
                workExperienceUrl: "",
            },
        ]);
    };

    const removeWorkExperience = (index) => {
        setWorkExperienceList((previous) =>
            previous.filter(
                (_, experienceIndex) => experienceIndex !== index
            )
        );

        setSaved(false);
    };
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await apiRequest("/api/candidates/me");

                console.log("CANDIDATE PROFILE:", response);

                const candidate = response.data.candidate;

                setForm({
                    name: [
                        candidate.first_name,
                        candidate.last_name,
                    ]
                        .filter(Boolean)
                        .join(" "),

                    headline: candidate.professional_headline || "",
                    country: candidate.country || "",
                    state: candidate.state || "",
                    city: candidate.city || "",
                    phone: candidate.phone_number || "",
                    bio: candidate.professional_summary || "",
                    linkedin: candidate.linkedin_url || "",
                    github: candidate.github_url || "",
                    website: candidate.personal_website_url || "",
                });
            } catch (error) {
                console.error("Failed to load profile:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);
    const handlePhoto = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setPhoto({
            file,
            url: imageUrl,
        });

        setSaved(false);
    };

    const handleResume = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setResume(file);
        setSaved(false);
    };

    const saveChanges = async () => {
        try {
            setSaving(true);
            setError("");
            setSaved(false);

            // Basic profile validation
            if (!form.name.trim()) {
                setError("Full name is required.");
                return;
            }

            if (!form.headline.trim()) {
                setError("Professional headline is required.");
                return;
            }

            if (!form.phone.trim()) {
                setError("Phone number is required.");
                return;
            }

            if (!form.country.trim()) {
                setError("Country is required.");
                return;
            }

            if (!form.state.trim()) {
                setError("State is required.");
                return;
            }

            if (!form.city.trim()) {
                setError("City is required.");
                return;
            }
            setError("");
            setSaved(false);

            const fullName = form.name.trim();

            const nameParts = fullName.split(/\s+/);

            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ");

            console.log("PROFILE SAVE:", {
                firstName,
                lastName,
                form,
            });

            const response = await apiRequest("/api/candidates/me", {
                method: "PUT",
                body: JSON.stringify({
                    professional_headline: form.headline.trim(),
                    phone_number: form.phone.trim(),
                    country: form.country.trim(),
                    state: form.state.trim(),
                    city: form.city.trim(),
                    professional_summary: form.bio.trim(),
                    linkedin_url: form.linkedin.trim(),
                    github_url: form.github.trim(),
                    personal_website_url: form.website.trim(),
                }),
            });

            console.log("PROFILE SAVED:", response);
            await saveEducation();
            await saveProjects();
            await saveInternships();
            await saveWorkExperiences();
            setSaved(true);

            setTimeout(() => {
                navigate("/candidate-dashboard");
            }, 800);
        } catch (error) {
            console.error("Failed to save profile:", error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };
    useEffect(() => {
        const loadEducation = async () => {
            try {
                const response = await apiRequest(
                    "/api/candidates/me/education"
                );

                console.log(
                    "EDUCATION FULL RESPONSE:",
                    JSON.stringify(response, null, 2)
                );

                const education = response.data.education || [];

                if (education.length === 0) {
                    return;
                }

                setOriginalEducationIds(
                    education.map((item) => item.id)
                );

                setEducationList(
                    education.map((item) => ({
                        id: item.id,
                        educationLevel: item.education_level || "",
                        degreeName: item.degree_name || "",
                        institutionName: item.institution_name || "",
                        startDate: item.start_date
                            ? new Date(item.start_date).toLocaleDateString("en-CA")
                            : "",
                        endDate: item.end_date
                            ? new Date(item.end_date).toLocaleDateString("en-CA")
                            : "",
                        score: item.score ?? "",
                        scoreType: item.score_type || "CGPA",
                    }))
                );
            } catch (error) {
                console.error(
                    "Failed to load education:",
                    error
                );
            }
        };

        loadEducation();
    }, []);
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const response = await apiRequest(
                    "/api/candidates/me/projects"
                );

                console.log(
                    "PROJECTS FULL RESPONSE:",
                    JSON.stringify(response, null, 2)
                );

                const projects = response.data.projects || [];

                if (projects.length === 0) {
                    return;
                }

                setOriginalProjectIds(
                    projects.map((item) => item.id)
                );

                setProjectList(
                    projects.map((item) => ({
                        id: item.id,
                        projectName: item.project_name || "",
                        description: item.description || "",
                        role: item.role || "",
                        technologiesUsed: item.technologies_used || "",
                        startDate: item.start_date
                            ? new Date(item.start_date).toLocaleDateString("en-CA")
                            : "",
                        endDate: item.end_date
                            ? new Date(item.end_date).toLocaleDateString("en-CA")
                            : "",
                        projectUrl: item.project_url || "",
                        teamSize: item.team_size ?? "",
                        isAcademicProject: Boolean(
                            item.is_academic_project
                        ),
                    }))
                );
            } catch (error) {
                console.error(
                    "Failed to load projects:",
                    error
                );
            }
        };

        loadProjects();
    }, []);
    const saveEducation = async () => {
        // 1. DELETE education records removed from the UI
        const currentEducationIds = educationList
            .filter((education) => education.id)
            .map((education) => String(education.id));

        const deletedEducationIds = originalEducationIds.filter(
            (id) => !currentEducationIds.includes(String(id))
        );

        for (const educationId of deletedEducationIds) {
            const response = await apiRequest(
                `/api/candidates/me/education/${educationId}`,
                {
                    method: "DELETE",
                }
            );

            console.log("EDUCATION DELETED:", response);
        }


        // 2. ADD new education records
        // 3. UPDATE existing education records
        const savedEducation = [];

        for (const education of educationList) {
            if (!education.educationLevel) {
                continue;
            }

            const payload = {
                education_level: education.educationLevel,
                degree_name: education.degreeName,
                institution_name: education.institutionName,
                start_date: education.startDate,
                end_date: education.endDate || null,
                score: education.score === "" ? null : Number(education.score),
                score_type: education.scoreType,
            };

            if (education.id) {
                // Existing record → UPDATE
                const response = await apiRequest(
                    `/api/candidates/me/education/${education.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );

                console.log("EDUCATION UPDATED:", response);

                savedEducation.push(
                    response.data.education
                );
            } else {
                // New record → CREATE
                const response = await apiRequest(
                    "/api/candidates/me/education",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    }
                );

                console.log("EDUCATION CREATED:", response);

                savedEducation.push(
                    response.data.education
                );
            }
        }


        // 4. Replace frontend state with the records returned by backend
        setOriginalEducationIds(
            savedEducation.map((education) => education.id)
        );

        if (savedEducation.length === 0) {
            setEducationList([
                {
                    id: null,
                    educationLevel: "",
                    degreeName: "",
                    institutionName: "",
                    startDate: "",
                    endDate: "",
                    score: "",
                    scoreType: "CGPA",
                },
            ]);

            setOriginalEducationIds([]);
            return;
        }

        setEducationList(
            savedEducation.map((item) => ({
                id: item.id,
                educationLevel: item.education_level || "",
                degreeName: item.degree_name || "",
                institutionName: item.institution_name || "",
                startDate: item.start_date
                    ? new Date(item.start_date).toLocaleDateString("en-CA")
                    : "",
                endDate: item.end_date
                    ? new Date(item.end_date).toLocaleDateString("en-CA")
                    : "",
                score: item.score ?? "",
                scoreType: item.score_type || "CGPA",
            }))
        );
    };
    const saveProjects = async () => {
        // 1. Find projects that were removed from the UI
        const currentProjectIds = projectList
            .filter((project) => project.id)
            .map((project) => String(project.id));

        const deletedProjectIds = originalProjectIds.filter(
            (id) =>
                !currentProjectIds.includes(String(id))
        );


        // 2. Delete removed projects
        for (const projectId of deletedProjectIds) {
            const response = await apiRequest(
                `/api/candidates/me/projects/${projectId}`,
                {
                    method: "DELETE",
                }
            );

            console.log(
                "PROJECT DELETED:",
                response
            );
        }


        // 3. Create/update projects
        const savedProjects = [];

        for (const project of projectList) {
            // Ignore completely blank project cards
            if (!project.projectName.trim()) {
                continue;
            }

            const payload = {
                project_name: project.projectName.trim(),
                description: project.description.trim(),
                role: project.role.trim(),
                technologies_used:
                    project.technologiesUsed.trim(),
                start_date: project.startDate || null,
                end_date: project.endDate || null,
                project_url:
                    project.projectUrl.trim() || null,
                team_size:
                    project.teamSize === ""
                        ? null
                        : Number(project.teamSize),
                is_academic_project:
                    project.isAcademicProject,
            };


            if (project.id) {
                // Existing project → UPDATE
                const response = await apiRequest(
                    `/api/candidates/me/projects/${project.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );

                console.log(
                    "PROJECT UPDATED:",
                    response
                );

                savedProjects.push(
                    response.data.project
                );
            } else {
                // New project → CREATE
                const response = await apiRequest(
                    "/api/candidates/me/projects",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    }
                );

                console.log(
                    "PROJECT CREATED:",
                    response
                );

                savedProjects.push(
                    response.data.project
                );
            }
        }


        // 4. Update frontend state with backend records
        setOriginalProjectIds(
            savedProjects.map(
                (project) => project.id
            )
        );


        if (savedProjects.length === 0) {
            setProjectList([
                {
                    id: null,
                    projectName: "",
                    description: "",
                    role: "",
                    technologiesUsed: "",
                    startDate: "",
                    endDate: "",
                    projectUrl: "",
                    teamSize: "",
                    isAcademicProject: false,
                },
            ]);

            setOriginalProjectIds([]);

            return;
        }


        setProjectList(
            savedProjects.map((item) => ({
                id: item.id,
                projectName:
                    item.project_name || "",
                description:
                    item.description || "",
                role:
                    item.role || "",
                technologiesUsed:
                    item.technologies_used || "",
                startDate: item.start_date
                    ? new Date(item.start_date).toLocaleDateString("en-CA")
                    : "",
                endDate: item.end_date
                    ? new Date(item.end_date).toLocaleDateString("en-CA")
                    : "",
                projectUrl:
                    item.project_url || "",
                teamSize:
                    item.team_size ?? "",
                isAcademicProject:
                    Boolean(item.is_academic_project),
            }))
        );
    };
    useEffect(() => {
        const loadInternships = async () => {
            try {
                const response = await apiRequest(
                    "/api/candidates/me/internships"
                );

                console.log(
                    "INTERNSHIPS FULL RESPONSE:",
                    JSON.stringify(response, null, 2)
                );

                const internships =
                    response.data.internships || [];

                if (internships.length === 0) {
                    return;
                }

                setOriginalInternshipIds(
                    internships.map((item) => item.id)
                );

                setInternshipList(
                    internships.map((item) => ({
                        id: item.id,
                        companyName:
                            item.company_name || "",
                        role:
                            item.role || "",
                        description:
                            item.description || "",
                        startDate: item.start_date
                            ? new Date(item.start_date)
                                .toLocaleDateString("en-CA")
                            : "",
                        endDate: item.end_date
                            ? new Date(item.end_date)
                                .toLocaleDateString("en-CA")
                            : "",
                        isCurrent:
                            Boolean(item.is_current),
                        location:
                            item.location || "",
                        workSetting:
                            item.work_setting || "",
                        technologiesUsed:
                            item.technologies_used || "",
                        certificateUrl:
                            item.certificate_url || "",
                        internshipUrl:
                            item.internship_url || "",
                    }))
                );
            } catch (error) {
                console.error(
                    "Failed to load internships:",
                    error
                );
            }
        };

        loadInternships();
    }, []);
    useEffect(() => {
        const loadWorkExperiences = async () => {
            try {
                const response = await apiRequest(
                    "/api/candidates/me/work-experience"
                );

                console.log(
                    "WORK EXPERIENCES FULL RESPONSE:",
                    JSON.stringify(response, null, 2)
                );

                const experiences =
                    response.data.experiences || [];

                if (experiences.length === 0) {
                    return;
                }

                setOriginalWorkExperienceIds(
                    experiences.map((item) => item.id)
                );

                setWorkExperienceList(
                    experiences.map((item) => ({
                        id: item.id,
                        companyName: item.company_name || "",
                        role: item.role || "",
                        description: item.description || "",

                        startDate: item.start_date
                            ? new Date(item.start_date)
                                .toLocaleDateString("en-CA")
                            : "",

                        endDate: item.end_date
                            ? new Date(item.end_date)
                                .toLocaleDateString("en-CA")
                            : "",

                        isCurrent: Boolean(item.is_current),

                        location: item.location || "",

                        workSetting:
                            item.work_setting || "",

                        technologiesUsed:
                            item.technologies_used || "",

                        certificateUrl:
                            item.certificate_url || "",

                        workExperienceUrl:
                            item.experience_url || "",
                    }))
                );
            } catch (error) {
                console.error(
                    "Failed to load work experiences:",
                    error
                );
            }
        };

        loadWorkExperiences();
    }, []);
    const saveInternships = async () => {
        // 1. Find internships removed from the UI
        const currentInternshipIds = internshipList
            .filter((internship) => internship.id)
            .map((internship) => String(internship.id));

        const deletedInternshipIds =
            originalInternshipIds.filter(
                (id) =>
                    !currentInternshipIds.includes(
                        String(id)
                    )
            );


        // 2. DELETE removed internships
        for (const internshipId of deletedInternshipIds) {
            const response = await apiRequest(
                `/api/candidates/me/internships/${internshipId}`,
                {
                    method: "DELETE",
                }
            );

            console.log(
                "INTERNSHIP DELETED:",
                response
            );
        }


        // 3. CREATE / UPDATE internships
        const savedInternships = [];

        for (const internship of internshipList) {

            // Ignore completely blank cards
            if (!internship.companyName.trim()) {
                continue;
            }

            const payload = {
                company_name:
                    internship.companyName.trim(),

                role:
                    internship.role.trim(),

                description:
                    internship.description.trim(),

                start_date:
                    internship.startDate || null,

                end_date:
                    internship.isCurrent
                        ? null
                        : internship.endDate || null,

                is_current:
                    internship.isCurrent,

                location:
                    internship.location.trim() || null,

                work_setting:
                    internship.workSetting || null,

                technologies_used:
                    internship.technologiesUsed.trim() || null,

                certificate_url:
                    internship.certificateUrl.trim() || null,

                internship_url:
                    internship.internshipUrl.trim() || null,
            };


            if (internship.id) {

                // Existing internship → UPDATE
                const response = await apiRequest(
                    `/api/candidates/me/internships/${internship.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );

                console.log(
                    "INTERNSHIP UPDATED:",
                    response
                );

                savedInternships.push(
                    response.data.internship
                );

            } else {

                // New internship → CREATE
                const response = await apiRequest(
                    "/api/candidates/me/internships",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    }
                );

                console.log(
                    "INTERNSHIP CREATED:",
                    response
                );

                savedInternships.push(
                    response.data.internship
                );
            }
        }


        // 4. Replace frontend state with backend records
        setOriginalInternshipIds(
            savedInternships.map(
                (internship) => internship.id
            )
        );


        if (savedInternships.length === 0) {
            setInternshipList([
                {
                    id: null,
                    companyName: "",
                    role: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                    location: "",
                    workSetting: "",
                    technologiesUsed: "",
                    certificateUrl: "",
                    internshipUrl: "",
                },
            ]);

            setOriginalInternshipIds([]);

            return;
        }


        setInternshipList(
            savedInternships.map((item) => ({
                id: item.id,

                companyName:
                    item.company_name || "",

                role:
                    item.role || "",

                description:
                    item.description || "",

                startDate: item.start_date
                    ? new Date(item.start_date)
                        .toLocaleDateString("en-CA")
                    : "",

                endDate: item.end_date
                    ? new Date(item.end_date)
                        .toLocaleDateString("en-CA")
                    : "",

                isCurrent:
                    Boolean(item.is_current),

                location:
                    item.location || "",

                workSetting:
                    item.work_setting || "",

                technologiesUsed:
                    item.technologies_used || "",

                certificateUrl:
                    item.certificate_url || "",

                internshipUrl:
                    item.internship_url || "",
            }))
        );
    };
    const saveWorkExperiences = async () => {
        // 1. Find work experiences removed from the UI
        const currentWorkExperienceIds = workExperienceList
            .filter((experience) => experience.id)
            .map((experience) => String(experience.id));

        const deletedWorkExperienceIds =
            originalWorkExperienceIds.filter(
                (id) =>
                    !currentWorkExperienceIds.includes(String(id))
            );

        // 2. DELETE removed work experiences
        for (const experienceId of deletedWorkExperienceIds) {
            const response = await apiRequest(
                `/api/candidates/me/work-experience/${experienceId}`,
                {
                    method: "DELETE",
                }
            );

            console.log(
                "WORK EXPERIENCE DELETED:",
                response
            );
        }

        // 3. CREATE / UPDATE work experiences
        const savedWorkExperiences = [];

        for (const experience of workExperienceList) {
            // Ignore completely blank cards
            if (!experience.companyName.trim()) {
                continue;
            }

            const payload = {
                company_name:
                    experience.companyName.trim(),

                role:
                    experience.role.trim(),

                description:
                    experience.description.trim(),

                start_date:
                    experience.startDate || null,

                end_date:
                    experience.isCurrent
                        ? null
                        : experience.endDate || null,

                is_current:
                    experience.isCurrent,

                location:
                    experience.location.trim() || null,

                work_setting:
                    experience.workSetting || null,

                technologies_used:
                    experience.technologiesUsed.trim() || null,

                certificate_url:
                    experience.certificateUrl.trim() || null,

                experience_url:
                    experience.workExperienceUrl.trim() || null,
            };

            if (experience.id) {
                // Existing experience → UPDATE
                const response = await apiRequest(
                    `/api/candidates/me/work-experience/${experience.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );

                console.log(
                    "WORK EXPERIENCE UPDATED:",
                    response
                );

                savedWorkExperiences.push(
                    response.data.experience
                );
            } else {
                // New experience → CREATE
                const response = await apiRequest(
                    "/api/candidates/me/work-experience",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    }
                );

                console.log(
                    "WORK EXPERIENCE CREATED:",
                    response
                );

                savedWorkExperiences.push(
                    response.data.experience
                );
            }
        }

        // 4. Replace frontend state with backend records
        setOriginalWorkExperienceIds(
            savedWorkExperiences.map(
                (experience) => experience.id
            )
        );

        if (savedWorkExperiences.length === 0) {
            setWorkExperienceList([
                {
                    id: null,
                    companyName: "",
                    role: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                    location: "",
                    workSetting: "",
                    technologiesUsed: "",
                    certificateUrl: "",
                    workExperienceUrl: "",
                },
            ]);

            setOriginalWorkExperienceIds([]);

            return;
        }

        setWorkExperienceList(
            savedWorkExperiences.map((item) => ({
                id: item.id,

                companyName:
                    item.company_name || "",

                role:
                    item.role || "",

                description:
                    item.description || "",

                startDate: item.start_date
                    ? new Date(item.start_date)
                        .toLocaleDateString("en-CA")
                    : "",

                endDate: item.end_date
                    ? new Date(item.end_date)
                        .toLocaleDateString("en-CA")
                    : "",

                isCurrent:
                    Boolean(item.is_current),

                location:
                    item.location || "",

                workSetting:
                    item.work_setting || "",

                technologiesUsed:
                    item.technologies_used || "",

                certificateUrl:
                    item.certificate_url || "",

                workExperienceUrl:
                    item.experience_url || "",
            }))
        );
    };
    const completeness = calculateCompleteness(form, resume);

    return (
        <section className="w-full max-w-screen-2xl mx-auto px-8 pt-7 pb-20 text-slate-900 text-left">
            <div className="flex items-center justify-center gap-3 mb-8 overflow-x-auto p-1">
                <Step number="✓" label="Account" status="done" />
                <div className="w-16 h-0.5 bg-blue-600 shrink-0" />
                <Step number="2" label="Profile" status="current" />
                <div className="w-16 h-0.5 bg-gray-200 shrink-0" />
                <Step number="3" label="Skills" status="" />
                <div className="w-16 h-0.5 bg-gray-200 shrink-0" />
                <Step number="4" label="Verification" status="" />
            </div>

            {/* PAGE HEADER */}
            <div className="flex items-center justify-between gap-8 mb-7">
                <div>
                    <span className="text-xs font-extrabold tracking-widest text-blue-600">
                        CANDIDATE PROFILE
                    </span>

                    <h1 className="mt-2 mb-1.5 text-4xl leading-tight tracking-tight">
                        Tell us about yourself
                    </h1>

                    <p className="m-0 text-gray-500 text-sm max-w-2xl">
                        Build a professional profile that helps recruiters understand
                        your experience, capabilities and career direction.
                    </p>
                </div>

            </div>

            {/* MAIN TWO-COLUMN AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 items-start">

                {/* LEFT — PROFILE FORM */}
                <div className="lg:col-span-2 min-w-0">

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-7">

                        <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
                            <div
                                className="w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 text-blue-600 bg-indigo-50">
                                <i className="fa-solid fa-user" />
                            </div>
                            <div>
                                <h2 className="m-0 text-lg">Basic information</h2>
                                <p className="mt-1 mb-0 text-gray-500 text-xs">
                                    This information appears on your verified profile.
                                </p>
                            </div>
                        </div>

                        {/* NAME + HEADLINE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Full name" required icon="fa-user">
                                <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm
                        outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4
                        focus:ring-blue-600/10"
                                />
                            </Field>

                            <Field label="Professional headline" required icon="fa-briefcase">
                                <input type="text" value={form.headline} onChange={(e) => updateField("headline",
                                    e.target.value)}
                                    placeholder="e.g. Cloud & DevOps Engineer"
                                    className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm
                        outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4
                        focus:ring-blue-600/10"
                                />
                            </Field>
                        </div>

                        {/* COUNTRY + LOCATION */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <Field label="Country" required icon="fa-globe">
                                <select
                                    value={form.country}
                                    onChange={(e) => updateField("country", e.target.value)}
                                    className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                >
                                    <option value="">Select country</option>
                                    <option>India</option>
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                    <option>Germany</option>
                                    <option>Singapore</option>
                                    <option>Canada</option>
                                    <option>United Arab Emirates</option>
                                    <option>Australia</option>
                                </select>
                            </Field>

                            <Field label="State" required icon="fa-map">
                                <input
                                    type="text"
                                    value={form.state}
                                    onChange={(e) => updateField("state", e.target.value)}
                                    placeholder="State"
                                    className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                />
                            </Field>

                            <Field label="City" required icon="fa-location-dot">
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => updateField("city", e.target.value)}
                                    placeholder="City"
                                    className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                />
                            </Field>

                        </div>



                        {/* PHONE */}
                        <Field label="Phone number" icon="fa-phone">
                            <div className="flex gap-2">
                                <select value={form.countryCode} onChange={(e) => updateField("countryCode", e.target.value)}
                                    className="w-24 h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900
                            text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4
                            focus:ring-blue-600/10"
                                >
                                    <option>+1</option>
                                    <option>+44</option>
                                    <option>+49</option>
                                    <option>+65</option>
                                    <option>+91</option>
                                    <option>+971</option>
                                </select>

                                <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)}
                                    placeholder="Phone number"
                                    className="flex-1 h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm
                        outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4
                        focus:ring-blue-600/10"
                                />
                            </div>
                        </Field>

                        {/* BIO */}

                        {/* REQUIRED PROFILE ACTION */}
                        <div className="mb-7 pb-6 border-b border-gray-100">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Basic profile complete?
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        You can continue now and add optional information later.
                                    </p>
                                </div>

                                <PrimaryButton
                                    onClick={saveChanges}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save & Continue"}
                                    {!saving && (
                                        <i className="fa-solid fa-arrow-right ml-2" />
                                    )}
                                </PrimaryButton>
                            </div>
                        </div>
                        {/* OPTIONAL INFORMATION */}
                        <div className="mt-8 pt-7 border-t border-gray-100">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowOptionalSections((previous) => !previous)
                                }
                                className="w-full flex items-center justify-between gap-4 text-left"
                            >
                                <div>
                                    <h3 className="m-0 text-base font-bold text-slate-900">
                                        Optional information
                                    </h3>

                                    <p className="mt-1 mb-0 text-xs text-gray-500">
                                        Add your summary, resume, education, projects and experience.
                                        You can complete these later.
                                    </p>
                                </div>

                                <div className="w-9 h-9 rounded-lg bg-gray-100 grid place-items-center shrink-0">
                                    <i
                                        className={`fa-solid ${showOptionalSections
                                            ? "fa-chevron-up"
                                            : "fa-chevron-down"
                                            } text-gray-500`}
                                    />
                                </div>
                            </button>

                            {showOptionalSections && (
                                <div className="mt-6">

                                    {/* BIO */}
                                    <Field label="Professional summary" icon="fa-align-left"
                                        hint="Keep this concise and focused on your professional strengths.">
                                        <textarea value={form.bio} onChange={(e) => updateField("bio", e.target.value)}
                                            rows="5"
                                            placeholder="Tell recruiters about your professional background..."
                                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm outline-none transition resize-y min-h-32 leading-relaxed focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                        />
                                    </Field>
                                    {/* RESUME */}
                                    <div className="mt-1.5 pt-7 border-t border-gray-100">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-10 h-10 rounded-xl grid place-items-center text-violet-600 bg-violet-50">
                                                <i className="fa-solid fa-file-lines" />
                                            </div>
                                            <div>
                                                <h3 className="m-0 text-base">Resume & online presence</h3>
                                                <p className="mt-1 mb-0 text-gray-500 text-xs">
                                                    Add supporting information recruiters can review.
                                                </p>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50 cursor-pointer mb-5 transition hover:border-blue-600 hover:bg-blue-50">
                                            <input
                                                ref={resumeInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleResume}
                                                hidden
                                            />

                                            <div className="w-11 h-11 rounded-xl grid place-items-center text-blue-600 bg-indigo-50 flex-shrink-0">
                                                <i className="fa-solid fa-cloud-arrow-up" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <strong className="block text-xs truncate">
                                                    {resume ? resume.name : "Upload your resume"}
                                                </strong>
                                                <span className="block mt-1 text-gray-500 text-xs">
                                                    {resume
                                                        ? `${formatFileSize(resume.size)} • Ready`
                                                        : "PDF, DOC or DOCX • Maximum 10MB"}
                                                </span>
                                            </div>

                                            <span className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-xs font-bold">
                                                {resume ? "Change" : "Browse"}
                                            </span>
                                        </label>

                                        {/* LINKS */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Field label="GitHub URL" icon="fa-github">
                                                <div className="relative">
                                                    <i className="fa-brands fa-github absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />

                                                    <input
                                                        type="url"
                                                        value={form.github}
                                                        onChange={(e) => updateField("github", e.target.value)}
                                                        placeholder="github.com/yourname"
                                                        className="w-full h-11 pl-9 pr-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                                    />
                                                </div>
                                            </Field>
                                            <Field label="LinkedIn / Portfolio URL" icon="fa-linkedin">
                                                <div className="relative">
                                                    <i className="fa-brands fa-linkedin absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                                                    <input
                                                        type="url"
                                                        value={form.linkedin}
                                                        onChange={(e) => updateField("linkedin", e.target.value)}
                                                        placeholder="linkedin.com/in/yourname"
                                                        className="w-full h-11 pl-9 pr-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                                    />
                                                </div>
                                            </Field>

                                            <Field label="Personal website" icon="fa-globe">
                                                <div className="relative">
                                                    <i className="fa-solid fa-globe absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                                                    <input
                                                        type="url"
                                                        value={form.website}
                                                        onChange={(e) => updateField("website", e.target.value)}
                                                        placeholder="yourwebsite.com"
                                                        className="w-full h-11 pl-9 pr-3 border border-gray-200 rounded-lg bg-gray-50 text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                                    />
                                                </div>
                                            </Field>
                                        </div>
                                    </div>
                                    {/* EDUCATION */}
                                    <div className="mt-7 pt-7 border-t border-gray-100">

                                        <div className="flex items-center justify-between gap-3 mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-indigo-50">
                                                    <i className="fa-solid fa-graduation-cap" />
                                                </div>

                                                <div>
                                                    <h3 className="m-0 text-base">
                                                        Education
                                                    </h3>

                                                    <p className="mt-1 mb-0 text-gray-500 text-xs">
                                                        Add your educational qualifications.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addEducation}
                                                className="flex items-center gap-2 px-3 py-2 border border-blue-200 rounded-lg text-blue-600 bg-blue-50 text-xs font-bold hover:bg-blue-100 transition"
                                            >
                                                <i className="fa-solid fa-plus" />
                                                Add Education
                                            </button>
                                        </div>

                                        <div className="space-y-5">

                                            {educationList.map((education, index) => (

                                                <div
                                                    key={education.id ?? index}
                                                    className="border border-gray-200 rounded-2xl p-5 bg-gray-50"
                                                >

                                                    <div className="flex items-center justify-between mb-5">

                                                        <h4 className="m-0 text-sm font-bold text-slate-800">
                                                            Education {index + 1}
                                                        </h4>

                                                        {educationList.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEducation(index)}
                                                                className="text-xs font-bold text-red-500 hover:text-red-600"
                                                            >
                                                                <i className="fa-solid fa-trash mr-1" />
                                                                Remove
                                                            </button>
                                                        )}

                                                    </div>

                                                    {/* LEVEL + DEGREE */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Education Level"
                                                            required
                                                            icon="fa-graduation-cap"
                                                        >
                                                            <select
                                                                value={education.educationLevel}
                                                                onChange={(e) =>
                                                                    updateEducation(
                                                                        index,
                                                                        "educationLevel",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            >
                                                                <option value="">
                                                                    Select education level
                                                                </option>
                                                                <option>10th / SSC</option>
                                                                <option>12th / HSC</option>
                                                                <option>Diploma</option>
                                                                <option>Bachelor's Degree</option>
                                                                <option>Master's Degree</option>
                                                                <option>PhD</option>
                                                                <option>Other</option>
                                                            </select>
                                                        </Field>

                                                        <Field
                                                            label="Degree Name"
                                                            required
                                                            icon="fa-book"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={education.degreeName}
                                                                onChange={(e) =>
                                                                    updateEducation(
                                                                        index,
                                                                        "degreeName",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. B.Tech in Computer Science"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>

                                                    {/* UNIVERSITY */}
                                                    <div className="mt-4">

                                                        <Field
                                                            label="University / College Name"
                                                            required
                                                            icon="fa-building-columns"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={education.institutionName}
                                                                onChange={(e) =>
                                                                    updateEducation(
                                                                        index,
                                                                        "institutionName",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="University or college name"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>

                                                    {/* DATES */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Start Date"
                                                            required
                                                            icon="fa-calendar"
                                                        >
                                                            <input
                                                                type="date"
                                                                value={education.startDate}
                                                                onChange={(e) =>
                                                                    updateEducation(
                                                                        index,
                                                                        "startDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                        <Field
                                                            label="End Date"
                                                            icon="fa-calendar-check"
                                                            hint="Optional"
                                                        >
                                                            <input
                                                                type="date"
                                                                value={education.endDate}
                                                                onChange={(e) =>
                                                                    updateEducation(
                                                                        index,
                                                                        "endDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>

                                                    {/* SCORE */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Score"
                                                            required
                                                            icon="fa-chart-line"
                                                        >
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={education.score}
                                                                onChange={(e) =>
                                                                    updateEducation(
                                                                        index,
                                                                        "score",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. 8.2"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                        <Field
                                                            label="Score Type"
                                                            required
                                                            icon="fa-percent"
                                                        >
                                                            <select
                                                                value={education.scoreType}
                                                                onChange={(e) =>
                                                                    updateEducation(
                                                                        index,
                                                                        "scoreType",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            >
                                                                <option value="CGPA">
                                                                    CGPA
                                                                </option>

                                                                <option value="Percentage">
                                                                    Percentage
                                                                </option>
                                                            </select>
                                                        </Field>

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    </div>

                                    {/* PROJECTS */}
                                    <div className="mt-7 pt-7 border-t border-gray-100">

                                        <div className="flex items-center justify-between gap-3 mb-5">

                                            <div className="flex items-center gap-3">

                                                <div className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-indigo-50">
                                                    <i className="fa-solid fa-code" />
                                                </div>

                                                <div>
                                                    <h3 className="m-0 text-base">
                                                        Projects
                                                    </h3>

                                                    <p className="mt-1 mb-0 text-gray-500 text-xs">
                                                        Showcase projects that demonstrate your skills and experience.
                                                    </p>
                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                onClick={addProject}
                                                className="flex items-center gap-2 px-3 py-2 border border-blue-200 rounded-lg text-blue-600 bg-blue-50 text-xs font-bold hover:bg-blue-100 transition"
                                            >
                                                <i className="fa-solid fa-plus" />
                                                Add Project
                                            </button>

                                        </div>


                                        <div className="space-y-5">

                                            {projectList.map((project, index) => (

                                                <div
                                                    key={project.id ?? index}
                                                    className="border border-gray-200 rounded-2xl p-5 bg-gray-50"
                                                >

                                                    {/* PROJECT HEADER */}
                                                    <div className="flex items-center justify-between mb-5">

                                                        <h4 className="m-0 text-sm font-bold text-slate-800">
                                                            Project {index + 1}
                                                        </h4>

                                                        {projectList.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeProject(index)}
                                                                className="text-xs font-bold text-red-500 hover:text-red-600"
                                                            >
                                                                <i className="fa-solid fa-trash mr-1" />
                                                                Remove
                                                            </button>
                                                        )}

                                                    </div>


                                                    {/* PROJECT NAME + ROLE */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Project Name"
                                                            required
                                                            icon="fa-diagram-project"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={project.projectName}
                                                                onChange={(e) =>
                                                                    updateProject(
                                                                        index,
                                                                        "projectName",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. SkillVerify Platform"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="Your Role"
                                                            required
                                                            icon="fa-user-tie"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={project.role}
                                                                onChange={(e) =>
                                                                    updateProject(
                                                                        index,
                                                                        "role",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. Frontend Developer"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* DESCRIPTION */}
                                                    <div className="mt-4">

                                                        <Field
                                                            label="Description"
                                                            required
                                                            icon="fa-align-left"
                                                            hint="Briefly describe the project, what you built and its purpose."
                                                        >
                                                            <textarea
                                                                value={project.description}
                                                                onChange={(e) =>
                                                                    updateProject(
                                                                        index,
                                                                        "description",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                rows="4"
                                                                placeholder="Describe the project and your contribution..."
                                                                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition resize-y min-h-28 leading-relaxed focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* TECHNOLOGIES */}
                                                    <div className="mt-1">

                                                        <Field
                                                            label="Technologies / Skills Used"
                                                            required
                                                            icon="fa-layer-group"
                                                            hint="Separate multiple technologies with commas."
                                                        >
                                                            <input
                                                                type="text"
                                                                value={project.technologiesUsed}
                                                                onChange={(e) =>
                                                                    updateProject(
                                                                        index,
                                                                        "technologiesUsed",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. React.js, Node.js, PostgreSQL"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* DATES */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Start Date"
                                                            icon="fa-calendar"
                                                            hint="Optional"
                                                        >
                                                            <input
                                                                type="date"
                                                                value={project.startDate}
                                                                onChange={(e) =>
                                                                    updateProject(
                                                                        index,
                                                                        "startDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="End Date"
                                                            icon="fa-calendar-check"
                                                            hint="Optional"
                                                        >
                                                            <input
                                                                type="date"
                                                                value={project.endDate}
                                                                onChange={(e) =>
                                                                    updateProject(
                                                                        index,
                                                                        "endDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* URL + TEAM SIZE */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Project URL"
                                                            icon="fa-link"
                                                            hint="Optional"
                                                        >
                                                            <div className="relative">

                                                                <i className="fa-solid fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />

                                                                <input
                                                                    type="url"
                                                                    value={project.projectUrl}
                                                                    onChange={(e) =>
                                                                        updateProject(
                                                                            index,
                                                                            "projectUrl",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="https://github.com/yourproject"
                                                                    className="w-full h-11 pl-9 pr-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                                />

                                                            </div>
                                                        </Field>


                                                        <Field
                                                            label="Team Size"
                                                            icon="fa-users"
                                                            hint="Optional"
                                                        >
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={project.teamSize}
                                                                onChange={(e) =>
                                                                    updateProject(
                                                                        index,
                                                                        "teamSize",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. 4"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* ACADEMIC PROJECT */}
                                                    <div className="mt-1">

                                                        <label className="flex items-center gap-3 cursor-pointer">

                                                            <input
                                                                type="checkbox"
                                                                checked={project.isAcademicProject}
                                                                onChange={(e) =>
                                                                    updateProject(
                                                                        index,
                                                                        "isAcademicProject",
                                                                        e.target.checked
                                                                    )
                                                                }
                                                                className="w-4 h-4 accent-blue-600"
                                                            />

                                                            <span className="text-sm font-semibold text-slate-800">
                                                                This is an academic project
                                                            </span>

                                                        </label>

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    </div>
                                    {/* INTERNSHIP */}
                                    <div className="mt-7 pt-7 border-t border-gray-100">

                                        <div className="flex items-center justify-between gap-3 mb-5">

                                            <div className="flex items-center gap-3">

                                                <div className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-indigo-50">
                                                    <i className="fa-solid fa-briefcase" />
                                                </div>

                                                <div>
                                                    <h3 className="m-0 text-base">
                                                        Internships
                                                    </h3>

                                                    <p className="mt-1 mb-0 text-gray-500 text-xs">
                                                        Add internships that demonstrate your practical experience.
                                                    </p>
                                                </div>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={addInternship}
                                                className="flex items-center gap-2 px-3 py-2 border border-blue-200 rounded-lg text-blue-600 bg-blue-50 text-xs font-bold hover:bg-blue-100 transition"
                                            >
                                                <i className="fa-solid fa-plus" />
                                                Add Internship
                                            </button>

                                        </div>


                                        <div className="space-y-5">

                                            {internshipList.map((internship, index) => (

                                                <div
                                                    key={internship.id ?? index}
                                                    className="border border-gray-200 rounded-2xl p-5 bg-gray-50"
                                                >

                                                    {/* HEADER */}

                                                    <div className="flex items-center justify-between mb-5">

                                                        <h4 className="m-0 text-sm font-bold text-slate-800">
                                                            Internship {index + 1}
                                                        </h4>

                                                        {internshipList.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeInternship(index)
                                                                }
                                                                className="text-xs font-bold text-red-500 hover:text-red-600"
                                                            >
                                                                <i className="fa-solid fa-trash mr-1" />
                                                                Remove
                                                            </button>
                                                        )}

                                                    </div>


                                                    {/* COMPANY + ROLE */}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Company Name"
                                                            required
                                                            icon="fa-building"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={internship.companyName}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "companyName",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. ABC Technologies"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="Internship Role / Title"
                                                            required
                                                            icon="fa-user-tie"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={internship.role}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "role",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. Frontend Developer Intern"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* DESCRIPTION */}

                                                    <div className="mt-4">

                                                        <Field
                                                            label="Description"
                                                            required
                                                            icon="fa-align-left"
                                                            hint="Describe your responsibilities, work and contributions."
                                                        >
                                                            <textarea
                                                                value={internship.description}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "description",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                rows="4"
                                                                placeholder="Describe your internship and responsibilities..."
                                                                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition resize-y min-h-28 leading-relaxed focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* DATES */}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Start Date"
                                                            required
                                                            icon="fa-calendar"
                                                        >
                                                            <input
                                                                type="date"
                                                                value={internship.startDate}
                                                                max={
                                                                    !internship.isCurrent && internship.endDate
                                                                        ? internship.endDate
                                                                        : undefined
                                                                }
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "startDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="End Date"
                                                            icon="fa-calendar-check"
                                                            hint={
                                                                internship.isCurrent
                                                                    ? "Not required while currently working here."
                                                                    : "Optional"
                                                            }
                                                        >
                                                            <input
                                                                type="date"
                                                                value={internship.endDate}
                                                                min={internship.startDate || undefined}
                                                                disabled={internship.isCurrent}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "endDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* CURRENTLY WORKING */}

                                                    <div className="mt-1 mb-4">

                                                        <label className="flex items-center gap-3 cursor-pointer">

                                                            <input
                                                                type="checkbox"
                                                                checked={internship.isCurrent}
                                                                onChange={(e) => {
                                                                    updateInternship(
                                                                        index,
                                                                        "isCurrent",
                                                                        e.target.checked
                                                                    );

                                                                    if (e.target.checked) {
                                                                        updateInternship(
                                                                            index,
                                                                            "endDate",
                                                                            ""
                                                                        );
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-blue-600"
                                                            />

                                                            <span className="text-sm font-semibold text-slate-800">
                                                                I currently work here
                                                            </span>

                                                        </label>

                                                    </div>


                                                    {/* LOCATION + WORK SETTING */}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Location"
                                                            icon="fa-location-dot"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={internship.location}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "location",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. Ahmedabad, Gujarat"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="Work Setting"
                                                            icon="fa-house-laptop"
                                                        >
                                                            <select
                                                                value={internship.workSetting}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "workSetting",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            >
                                                                <option value="">
                                                                    Select work setting
                                                                </option>
                                                                <option value="Remote">
                                                                    Remote
                                                                </option>
                                                                <option value="Hybrid">
                                                                    Hybrid
                                                                </option>
                                                                <option value="On-site">
                                                                    On-site
                                                                </option>
                                                            </select>
                                                        </Field>

                                                    </div>


                                                    {/* TECHNOLOGIES */}

                                                    <div className="mt-4">

                                                        <Field
                                                            label="Technologies / Skills Used"
                                                            icon="fa-layer-group"
                                                            hint="Separate multiple technologies with commas."
                                                        >
                                                            <input
                                                                type="text"
                                                                value={internship.technologiesUsed}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "technologiesUsed",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. React.js, JavaScript, Node.js"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* URLS */}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Certificate / Proof URL"
                                                            icon="fa-certificate"
                                                            hint="Optional"
                                                        >
                                                            <input
                                                                type="url"
                                                                value={internship.certificateUrl}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "certificateUrl",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="https://example.com/certificate"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="Internship URL"
                                                            icon="fa-link"
                                                            hint="Optional"
                                                        >
                                                            <input
                                                                type="url"
                                                                value={internship.internshipUrl}
                                                                onChange={(e) =>
                                                                    updateInternship(
                                                                        index,
                                                                        "internshipUrl",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="https://company.com/internship"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    </div>
                                    {/* WORK EXPERIENCE */}
                                    <div className="mt-7 pt-7 border-t border-gray-100">

                                        <div className="flex items-center justify-between gap-3 mb-5">

                                            <div className="flex items-center gap-3">

                                                <div className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-indigo-50">
                                                    <i className="fa-solid fa-briefcase" />
                                                </div>

                                                <div>
                                                    <h3 className="m-0 text-base">
                                                        Work Experience
                                                    </h3>

                                                    <p className="mt-1 mb-0 text-gray-500 text-xs">
                                                        Add your professional work experience and responsibilities.
                                                    </p>
                                                </div>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={addWorkExperience}
                                                className="flex items-center gap-2 px-3 py-2 border border-blue-200 rounded-lg text-blue-600 bg-blue-50 text-xs font-bold hover:bg-blue-100 transition"
                                            >
                                                <i className="fa-solid fa-plus" />
                                                Add Experience
                                            </button>

                                        </div>


                                        <div className="space-y-5">

                                            {workExperienceList.map((experience, index) => (

                                                <div
                                                    key={experience.id ?? index}
                                                    className="border border-gray-200 rounded-2xl p-5 bg-gray-50"
                                                >

                                                    {/* HEADER */}

                                                    <div className="flex items-center justify-between mb-5">

                                                        <h4 className="m-0 text-sm font-bold text-slate-800">
                                                            Work Experience {index + 1}
                                                        </h4>

                                                        {workExperienceList.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeWorkExperience(index)
                                                                }
                                                                className="text-xs font-bold text-red-500 hover:text-red-600"
                                                            >
                                                                <i className="fa-solid fa-trash mr-1" />
                                                                Remove
                                                            </button>
                                                        )}

                                                    </div>


                                                    {/* COMPANY + ROLE */}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Company Name"
                                                            required
                                                            icon="fa-building"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={experience.companyName}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "companyName",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. ABC Technologies"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="Job Role / Title"
                                                            required
                                                            icon="fa-user-tie"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={experience.role}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "role",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. Frontend Developer"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* DESCRIPTION */}

                                                    <div className="mt-4">

                                                        <Field
                                                            label="Description"
                                                            required
                                                            icon="fa-align-left"
                                                            hint="Describe your responsibilities, work and contributions."
                                                        >
                                                            <textarea
                                                                value={experience.description}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "description",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                rows="4"
                                                                placeholder="Describe your responsibilities and contributions..."
                                                                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition resize-y min-h-28 leading-relaxed focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* DATES */}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Start Date"
                                                            required
                                                            icon="fa-calendar"
                                                        >
                                                            <input
                                                                type="date"
                                                                value={experience.startDate}
                                                                max={
                                                                    !experience.isCurrent && experience.endDate
                                                                        ? experience.endDate
                                                                        : undefined
                                                                }
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "startDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="End Date"
                                                            icon="fa-calendar-check"
                                                            hint={
                                                                experience.isCurrent
                                                                    ? "Not required while currently working here."
                                                                    : "Optional"
                                                            }
                                                        >
                                                            <input
                                                                type="date"
                                                                value={experience.endDate}
                                                                min={experience.startDate || undefined}
                                                                disabled={experience.isCurrent}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "endDate",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* CURRENTLY WORKING */}

                                                    <div className="mt-1 mb-4">

                                                        <label className="flex items-center gap-3 cursor-pointer">

                                                            <input
                                                                type="checkbox"
                                                                checked={experience.isCurrent}
                                                                onChange={(e) => {
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "isCurrent",
                                                                        e.target.checked
                                                                    );

                                                                    if (e.target.checked) {
                                                                        updateWorkExperience(
                                                                            index,
                                                                            "endDate",
                                                                            ""
                                                                        );
                                                                    }
                                                                }}
                                                                className="w-4 h-4 accent-blue-600"
                                                            />

                                                            <span className="text-sm font-semibold text-slate-800">
                                                                I currently work here
                                                            </span>

                                                        </label>

                                                    </div>


                                                    {/* LOCATION + WORK SETTING */}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Location"
                                                            icon="fa-location-dot"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={experience.location}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "location",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. Ahmedabad, Gujarat"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="Work Setting"
                                                            icon="fa-house-laptop"
                                                        >
                                                            <select
                                                                value={experience.workSetting}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "workSetting",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            >
                                                                <option value="">
                                                                    Select work setting
                                                                </option>
                                                                <option value="Remote">
                                                                    Remote
                                                                </option>
                                                                <option value="Hybrid">
                                                                    Hybrid
                                                                </option>
                                                                <option value="On-site">
                                                                    On-site
                                                                </option>
                                                            </select>
                                                        </Field>

                                                    </div>


                                                    {/* TECHNOLOGIES */}

                                                    <div className="mt-4">

                                                        <Field
                                                            label="Technologies / Skills Used"
                                                            icon="fa-layer-group"
                                                            hint="Separate multiple technologies with commas."
                                                        >
                                                            <input
                                                                type="text"
                                                                value={experience.technologiesUsed}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "technologiesUsed",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. React.js, JavaScript, Node.js"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>


                                                    {/* URLS */}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        <Field
                                                            label="Certificate / Proof URL"
                                                            icon="fa-certificate"
                                                            hint="Optional"
                                                        >
                                                            <input
                                                                type="url"
                                                                value={experience.certificateUrl}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "certificateUrl",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="https://example.com/certificate"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>


                                                        <Field
                                                            label="Work Experience URL"
                                                            icon="fa-link"
                                                            hint="Optional"
                                                        >
                                                            <input
                                                                type="url"
                                                                value={experience.workExperienceUrl}
                                                                onChange={(e) =>
                                                                    updateWorkExperience(
                                                                        index,
                                                                        "workExperienceUrl",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="https://company.com/experience"
                                                                className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-slate-900 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                                            />
                                                        </Field>

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="flex items-center justify-between gap-4 mt-5">
                        {error && (
                            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}
                        {saved && (
                            <div className="mt-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                Profile saved successfully.
                            </div>
                        )}
                        <BackButton onClick={() => navigate("/candidate-dashboard")} />



                        <PrimaryButton
                            onClick={async () => {
                                await saveChanges();
                            }}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save & Continue"}
                            <i className="fa-solid fa-arrow-right" />
                        </PrimaryButton>

                    </div>

                </div>

            </div>
        </section>
    );
}

/* STEPPER COMPONENT */
function Step({ number, label, status }) {
    const active = status === "done" || status === "current";

    return (
        <div
            className={`flex items-center gap-1.5 flex-shrink-0 text-xs font-bold ${active ? "text-blue-600" : "text-gray-400"
                }`}
        >
            <div
                className={`w-7 h-7 rounded-full grid place-items-center border text-xs ${status === "done"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : status === "current"
                        ? "border-blue-600 text-blue-600 ring-4 ring-blue-600/10 bg-white"
                        : "border-gray-200 bg-white"
                    }`}
            >
                {number}
            </div>
            <span>{label}</span>
        </div>
    );
}

/* FIELD COMPONENT */
function Field({ label, required = false, icon, hint, children }) {
    return (
        <div className="mb-5">
            <label className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800">
                {icon && <i className={`fa-solid ${icon} text-gray-500 text-xs`} />}
                {label}
                {required && <span className="text-blue-600">*</span>}
            </label>

            {children}

            {hint && <span className="block mt-1.5 text-gray-400 text-xs">{hint}</span>}
        </div>
    );
}

/* CHECK ITEM */
function CheckItem({ done, text }) {
    return (
        <div className="flex items-center gap-2 text-gray-500 text-xs">
            <i
                className={`fa-solid ${done ? "fa-circle-check text-green-600" : "fa-circle text-gray-400"}`}
            />
            <span>{text}</span>
        </div>
    );
}

/* HELPERS */
function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function calculateCompleteness(form, resume) {
    let score = 0;

    if (form.name) score += 15;
    if (form.headline) score += 15;
    if (form.country) score += 10;
    if (form.city) score += 10;
    if (form.phone) score += 10;
    if (form.experience) score += 10;
    if (form.bio) score += 15;
    if (resume) score += 10;
    if (form.linkedin || form.website) score += 5;

    return Math.min(score, 100);
}

function formatFileSize(bytes) {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
        return `${Math.round(kb)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
}

export default C1_Profile_Setup;