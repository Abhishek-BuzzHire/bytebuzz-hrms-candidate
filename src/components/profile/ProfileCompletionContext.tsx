"use client";

import React, { createContext, useContext, useState } from "react";

type ProfileCompletionContextType = {
    completion: number;
    setCompletion: React.Dispatch<React.SetStateAction<number>>;
};

const ProfileCompletionContext = createContext<
    ProfileCompletionContextType | undefined
>(undefined);

export const ProfileCompletionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [completion, setCompletion] = useState(0);

    return (
        <ProfileCompletionContext.Provider value={{ completion, setCompletion }}>
            {children}
        </ProfileCompletionContext.Provider>
    );
};

export const useProfileCompletion = () => {
    const context = useContext(ProfileCompletionContext);

    if (!context) {
        throw new Error("useProfileCompletion must be used inside provider");
    }

    return context;
};