"use client";

import { useRef, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Lock, User } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";
type ChangePasswordProps = {
    avatar: string;
    onBack: () => void;
    onSuccess: () => void;
    onBusyChange: (busy: boolean) => void;
};

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };
const PASSWORD_FIELDS = [
    { name: "currentPassword", label: "Current Password", autoComplete: "current-password" },
    { name: "newPassword", label: "New Password", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Confirm New Password", autoComplete: "new-password" },
] as const;

export default function ChangePassword({ avatar, onBack, onSuccess, onBusyChange }: ChangePasswordProps) {
    const { user, setUser } = useAuth();
    const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
    const [errors, setErrors] = useState<Partial<Record<PasswordField, string>>>({});
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const submittingRef = useRef(false);

    function focusField(field: PasswordField) {
        requestAnimationFrame(() => document.getElementById(`change-${field}`)?.focus());
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user || submittingRef.current) return;

        const nextErrors: Partial<Record<PasswordField, string>> = {};
        const currentLength = [...passwords.currentPassword].length;
        const newLength = [...passwords.newPassword].length;
        if (currentLength < 1 || currentLength > 128) nextErrors.currentPassword = "Enter your current password (1–128 characters).";
        if (newLength < 10 || newLength > 128) nextErrors.newPassword = "New password must be 10–128 characters.";
        else if (passwords.newPassword === passwords.currentPassword) nextErrors.newPassword = "Choose a password different from your current password.";
        if (passwords.confirmPassword !== passwords.newPassword) nextErrors.confirmPassword = "Passwords do not match.";
        setErrors(nextErrors);
        setMessage("");
        const invalidField = PASSWORD_FIELDS.find(({ name }) => nextErrors[name]);
        if (invalidField) {
            focusField(invalidField.name);
            return;
        }

        const ownerID = user.userID;
        submittingRef.current = true;
        setIsSaving(true);
        onBusyChange(true);
        try {
            const response = await axiosInstance.patch("/api/auth/password", passwords);
            if (response.data?.success !== true) throw new Error("Invalid password change response");

            setPasswords(EMPTY_PASSWORDS);
            onSuccess();
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                setPasswords(EMPTY_PASSWORDS);
                setUser((current) => current?.userID === ownerID ? null : current);
            } else {
                const data = isAxiosError(error) ? error.response?.data : undefined;
                const errorMessage = typeof data?.message === "string" ? data.message : "Unable to change password. Please try again.";
                const field = PASSWORD_FIELDS.find(({ name }) => name === data?.field)?.name;
                if (field) {
                    setErrors({ [field]: errorMessage });
                    focusField(field);
                } else {
                    setMessage(errorMessage);
                }
            }
        } finally {
            submittingRef.current = false;
            setIsSaving(false);
            onBusyChange(false);
        }
    }

    return (
        <form noValidate onSubmit={handleSubmit} aria-busy={isSaving} className="mx-auto mt-3 flex w-full max-w-[470px] flex-col items-center sm:mt-6 lg:mt-4">
            <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E0ECDD] sm:size-40 lg:size-24">
                {avatar ? (
                    <img src={avatar} alt="Profile photo" className="size-full object-cover" />
                ) : <User aria-hidden="true" className="size-10 text-[#526E4E] sm:size-24 lg:size-14" strokeWidth={1.25} />}
            </div>

            <div className="mt-4 w-full space-y-3 sm:mt-8 sm:space-y-6 lg:mt-4 lg:space-y-3">
                {PASSWORD_FIELDS.map(({ name, label, autoComplete }) => (
                    <div key={name} className="space-y-1 sm:space-y-2 lg:space-y-1">
                        <label htmlFor={`change-${name}`} className="block text-sm font-medium sm:text-lg lg:text-sm">{label}</label>
                        <InputGroup className="h-11 rounded-md border-[#CBD5E1] bg-white sm:h-14 lg:h-11">
                            <InputGroupAddon className="pl-3"><Lock aria-hidden="true" className="size-5 text-[#92999E]" /></InputGroupAddon>
                            <InputGroupInput
                                id={`change-${name}`}
                                name={name}
                                type="password"
                                autoComplete={autoComplete}
                                required
                                disabled={isSaving}
                                value={passwords[name]}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setPasswords((current) => ({ ...current, [name]: value }));
                                    setErrors((current) => ({ ...current, [name]: undefined }));
                                    setMessage("");
                                }}
                                aria-invalid={Boolean(errors[name])}
                                aria-describedby={errors[name] ? `change-${name}-error` : name === "newPassword" ? "password-rules" : undefined}
                                className="h-full text-base md:text-base"
                            />
                        </InputGroup>
                        {errors[name] && <p id={`change-${name}-error`} role="alert" className="text-sm text-[#AE3C32]">{errors[name]}</p>}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex w-full max-w-[344px] flex-col gap-2 sm:mt-7 sm:gap-6 lg:mt-4 lg:gap-2">
                <Button type="submit" disabled={isSaving} className="h-11 w-full rounded-md bg-[#93A58F] text-sm text-[#171C18] hover:bg-[#81977C] disabled:opacity-65">
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" disabled={isSaving} onClick={onBack} className="h-11 w-full rounded-md bg-[#B5756C] text-sm text-[#171C18] hover:bg-[#A8655C]">Cancel</Button>
            </div>
            <p id="password-rules" className="mt-3 text-center text-xs text-[#7A817D] sm:mt-4 lg:mt-3">Use a new password with 10–128 characters.</p>
            <div className="w-full text-center text-sm sm:mt-2 sm:min-h-5" aria-live="polite">
                {message && <p role="alert" className="max-sm:mt-2 text-[#AE3C32]">{message}</p>}
            </div>
        </form>
    );
}
