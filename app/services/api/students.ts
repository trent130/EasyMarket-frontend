import apiClient from "../api-client";
import { PaginatedResponse, Student } from "@/types/common";
import { AxiosResponse } from "axios";

interface StudentQueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    course?: string;
    year?: number;
    status?: Student['status'];
}

// Merged content from students.ts and studentsApi.ts
export const studentFunctions = {
        getStudents: (params?: Record<string, string | number>): Promise<PaginatedResponse<Student>> =>
            apiClient.get<PaginatedResponse<Student>>('/api/students', { params }).then(response => response.data),

        getStudentDetails: (id: number): Promise<Student> =>
            apiClient.get<Student>(`/api/students/${id}`).then(response => response.data),

        updateStudent: (id: number, data: Partial<Student>): Promise<any> =>
            apiClient.put(`/api/students/${id}`, data).then(response => response.data),

        deleteStudent: (id: number): Promise<any> =>
            apiClient.delete(`/api/students/${id}`).then(response => response.data)
};

// Add any additional functions or logic as needed
