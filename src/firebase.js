import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaVSef2HDEajhFNqA8uIzi1_l1L1X_gE0",
  authDomain: "reserva-mesas-d785b.firebaseapp.com",
  projectId: "reserva-mesas-d785b",
  storageBucket: "reserva-mesas-d785b.appspot.com",
  messagingSenderId: "796432331485",
  appId: "1:796432331485:web:52d5e55f622d90bc472134"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
