
<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div v-if="!usuarioRegistrado" class="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 class="text-2xl font-bold mb-4 text-center">Registro de Usuario</h1>
      <input v-model="nombre" type="text" placeholder="Nombre completo" class="input mb-2" />
      <input v-model="catalogo" type="text" placeholder="Número de catálogo" class="input mb-4" />
      <button @click="registrarUsuario" class="btn">Registrar</button>
    </div>

    <div v-else class="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h1 class="text-2xl font-bold mb-4 text-center">Reserva de Mesas y Sillas</h1>

      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-2">Selecciona una mesa</h2>
        <button
          v-for="mesa in mesas"
          :key="mesa"
          @click="seleccionarMesa(mesa)"
          class="btn mr-2 mb-2"
          :class="{ 'bg-blue-500 text-white': mesaSeleccionada === mesa }"
        >
          Mesa {{ mesa }}
        </button>
      </div>

      <div v-if="mesaSeleccionada" class="mb-6">
        <h2 class="text-lg font-semibold mb-2">Mesa {{ mesaSeleccionada }} - Selecciona sillas</h2>
        <button
          v-for="silla in 10"
          :key="silla"
          @click="seleccionarSilla(silla - 1)"
          class="btn mr-2 mb-2"
          :disabled="sillasOcupadas.includes(silla - 1)"
          :class="{
            'bg-green-500 text-white': sillasSeleccionadas.includes(silla - 1),
            'bg-red-300 text-white': sillasOcupadas.includes(silla - 1)
          }"
        >
          Silla {{ silla }}
        </button>
      </div>

      <button
        @click="confirmarReserva"
        class="btn bg-purple-600 text-white"
        :disabled="sillasSeleccionadas.length === 0"
      >
        Confirmar Reserva
      </button>

      <div v-if="reservaConfirmada" class="mt-6 border-t pt-4">
        <h2 class="text-xl font-bold mb-2">🎟️ Ticket de Reserva</h2>
        <p><strong>Nombre:</strong> {{ nombre }}</p>
        <p><strong>Catálogo:</strong> {{ catalogo }}</p>
        <p><strong>Mesa:</strong> {{ mesaSeleccionada }}</p>
        <p><strong>Sillas:</strong> {{ sillasSeleccionadas.map(n => n + 1).join(', ') }}</p>
        <button @click="descargarPDF" class="btn mt-4">Descargar PDF</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';

const nombre = ref('');
const catalogo = ref('');
const usuarioRegistrado = ref(false);
const mesaSeleccionada = ref(null);
const sillasSeleccionadas = ref([]);
const sillasOcupadas = ref([]);
const reservaConfirmada = ref(false);
const mesas = Array.from({ length: 10 }, (_, i) => i + 1);

const registrarUsuario = async () => {
  const query = await getDocs(collection(db, 'reservas'));
  const existe = query.docs.some(doc => doc.data().catalogo === catalogo.value.trim());

  if (existe) {
    alert('Este número de catálogo ya está registrado.');
    return;
  }

  usuarioRegistrado.value = true;
};

const seleccionarMesa = async (mesa) => {
  mesaSeleccionada.value = mesa;
  sillasSeleccionadas.value = [];

  const query = await getDocs(collection(db, 'reservas'));
  sillasOcupadas.value = [];

  query.forEach(doc => {
    const data = doc.data();
    if (data.mesa === mesa) {
      sillasOcupadas.value.push(...data.sillas);
    }
  });
};

const seleccionarSilla = (silla) => {
  if (sillasSeleccionadas.value.includes(silla)) {
    sillasSeleccionadas.value = sillasSeleccionadas.value.filter(s => s !== silla);
  } else if (sillasSeleccionadas.value.length < 2) {
    sillasSeleccionadas.value.push(silla);
  }
};

const confirmarReserva = async () => {
  await addDoc(collection(db, 'reservas'), {
    nombre: nombre.value,
    catalogo: catalogo.value,
    mesa: mesaSeleccionada.value,
    sillas: sillasSeleccionadas.value
  });

  reservaConfirmada.value = true;
};

const descargarPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('🎟️ Ticket de Reserva', 20, 20);
  doc.setFontSize(12);
  doc.text(`Nombre: ${nombre.value}`, 20, 40);
  doc.text(`Catálogo: ${catalogo.value}`, 20, 50);
  doc.text(`Mesa: ${mesaSeleccionada.value}`, 20, 60);
  doc.text(`Sillas: ${sillasSeleccionadas.value.map(n => n + 1).join(', ')}`, 20, 70);
  doc.save('reserva.pdf');
};
</script>

<style scoped>
.input {
  @apply w-full border px-3 py-2 rounded mb-2;
}
.btn {
  @apply px-4 py-2 rounded bg-gray-200 hover:bg-gray-300;
}
</style>
