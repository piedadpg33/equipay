import { userService } from "@/services";
import { Session } from "@supabase/supabase-js";
import * as Linking from 'expo-linking';
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

// Configure WebBrowser for better OAuth experience
WebBrowser.maybeCompleteAuthSession();

//info that will have our authentication
type AuthData = {
    loading: boolean;
    session: Session | null;
    nameUser?: string | null;
};

const AuthContext = createContext<AuthData>({
    loading: true,
    session: null,
});

//our provider will be te father off all the app
interface Props {
    children: React.ReactNode;
}

export default function AuthProvider(props: Props) {
    const [loading, setLoading] = useState<boolean>(true);
    const [session, setSession] = useState<Session | null>(null);
    const [nameUser, setNameUser] = useState<string | null>(null); // State to hold the user's name

    useEffect(() => {
        //watch if the user have a inited session in supabase
        async function fetchSession() {
            const {error,data} = await supabase.auth.getSession();

            if (error){
                console.log("Error fetching session:", error.message);
            }

            if (data.session) { 
                setSession(data.session);
            } else { //if there is no session, we will send the user to sign in
               router.replace("/signin" );
            }
            setLoading(false); //stop the loading
        
        }

        fetchSession(); //the only way to call an async function in useEffect

        // Handle deep links for OAuth
        const handleDeepLink = async (url: string) => {
            console.log('Deep link received:', url);
            
            if (url && (url.includes('#access_token') || url.includes('?code=') || url.includes('auth/callback'))) {
                try {
                    // Extract the hash fragment for OAuth
                    if (url.includes('#')) {
                        const hashParams = new URLSearchParams(url.split('#')[1]);
                        const accessToken = hashParams.get('access_token');
                        const refreshToken = hashParams.get('refresh_token');
                        
                        if (accessToken) {
                            // Set the session using the tokens
                            const { data, error } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken || '',
                            });
                            
                            if (error) {
                                console.error('Error setting session:', error);
                            } else if (data.session) {
                                console.log('Session set successfully');
                                setSession(data.session);
                                router.replace('/');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error handling deep link:', error);
                }
            }
        };

        // Listen for deep links
        const subscription = Linking.addEventListener('url', ({ url }) => {
            console.log('Deep link event received:', url);
            handleDeepLink(url);
        });

        // Check if app was opened with a deep link
        Linking.getInitialURL().then((url) => {
            console.log('Initial URL:', url);
            if (url) {
                handleDeepLink(url);
            }
        });

        
        const { data: authListener } = supabase.auth.onAuthStateChange(async(_,session) => {
        console.log("Auth state changed:", session);
        setSession(session);
        setLoading(false);

        const uuid = session?.user.id;
        
        // If there is a UUID
        if (uuid) {
            console.log("Session user ID:", uuid);
            // Search the name of the user in the database
            const user =  userService.getUserById(uuid)
                .then(user=>
                {
                    if (session && user) {
                        setNameUser(user.user_name);
                        router.replace("/");
                    } else if (session && !user) {
                        router.replace("/registername"); 
                    }
                }
                );
        } else {
            router.replace("/signin" ); //if there is no session, we will send the user to sign in
        }
    });

        return () => {
            authListener?.subscription.unsubscribe(); //cleanup the listener when the component is unmounted
            subscription?.remove(); // cleanup deep link listener
        }


    }, []);

    return (
        <AuthContext.Provider value={{ loading, session, nameUser }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); //custom hook to use the auth context