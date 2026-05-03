import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSC5AV2XVIgdhx9jMEueaI-gwh6gqiexg",
  authDomain: "banco-de-dados-julio.firebaseapp.com",
  projectId: "banco-de-dados-julio"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export function mapAuthError(error) {
  const code = error?.code || "";
  const map = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "Credenciais inválidas. Verifique e-mail e senha.",
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres.",
    "auth/popup-closed-by-user": "Login cancelado (popup fechado).",
    "auth/cancelled-popup-request": "Aguarde o popup anterior ou tente novamente.",
    "auth/account-exists-with-different-credential": "Já existe uma conta com este e-mail usando outro provedor.",
    "auth/operation-not-allowed": "Provedor não habilitado no Firebase Console."
  };
  return map[code] || error?.message || "Ocorreu um erro. Tente novamente.";
}

export async function registerWithEmail(email, password) {
  await createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  await signInWithPopup(auth, googleProvider);
}

export async function signInWithGithub() {
  await signInWithPopup(auth, githubProvider);
}

export async function signOutUser() {
  await signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}