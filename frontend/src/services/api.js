const API_BASE_URL = "http://localhost:5000";

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    console.log("API response:", {
        status: response.status,
        data,
    });

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Something went wrong"
        );
    }

    return data;
};

export default apiRequest;