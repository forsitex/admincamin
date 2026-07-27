'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import {
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query,
} from 'firebase/firestore';
import {
  ArrowLeft, Building, Users, Bed, UserPlus, ArrowRightLeft, LogOut, X,
} from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  floor: string;
  isIsolator?: boolean;
}

interface Resident {
  cnp: string;
  beneficiarNumeComplet: string;
  beneficiarCnp: string;
  roomId?: string;
  roomNumber?: string;
  caminId?: string;
  dataInternare?: string;
  gradDependenta?: string;
}

interface Location {
  id: string;
  name: string;
}

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caminId = params.id as string;
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [roomResidents, setRoomResidents] = useState<Resident[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [unassignedResidents, setUnassignedResidents] = useState<Resident[]>([]);
  const [allRoomsInLocation, setAllRoomsInLocation] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMigrateModal, setShowMigrateModal] = useState<string | null>(null);
  const [migrateTargetLocation, setMigrateTargetLocation] = useState(caminId);
  const [migrateTargetRoom, setMigrateTargetRoom] = useState('');
  const [migrateRooms, setMigrateRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
        return;
      }

      try {
        // Camera curenta
        const roomDoc = await getDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'rooms', roomId));
        if (roomDoc.exists()) {
          setRoom({ id: roomDoc.id, ...roomDoc.data() } as Room);
        }

        // Toate locatiile
        const locSnap = await getDocs(collection(db, 'organizations', user.uid, 'locations'));
        const locs = locSnap.docs.map(d => ({ id: d.id, ...d.data() } as Location));
        setAllLocations(locs);

        // Rezidentii din aceasta camera
        const resSnap = await getDocs(collection(db, 'organizations', user.uid, 'locations', caminId, 'residents'));
        const allRes = resSnap.docs.map(d => ({ cnp: d.id, ...d.data() } as Resident));
        setRoomResidents(allRes.filter(r => r.roomId === roomId));

        // Rezidentii fara camera din aceasta locatie
        setUnassignedResidents(allRes.filter(r => !r.roomId));

        // Toate camerele din aceasta locatie
        const roomsSnap = await getDocs(collection(db, 'organizations', user.uid, 'locations', caminId, 'rooms'));
        const roomsList = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Room));
        setAllRoomsInLocation(roomsList.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber)));

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caminId, roomId, router]);

  // Incarca camerele cand se schimba locatia in modalul de migrare
  useEffect(() => {
    const fetchMigrateRooms = async () => {
      const user = auth.currentUser;
      if (!user || !migrateTargetLocation) return;

      const roomsSnap = await getDocs(collection(db, 'organizations', user.uid, 'locations', migrateTargetLocation, 'rooms'));
      const roomsList = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Room));
      setMigrateRooms(roomsList.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber)));
      setMigrateTargetRoom('');
    };

    if (showMigrateModal) {
      fetchMigrateRooms();
    }
  }, [migrateTargetLocation, showMigrateModal]);

  const handleAddResident = async (residentCnp: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', residentCnp), {
        roomId: roomId,
        roomNumber: room?.roomNumber || '',
      });

      // Refresh
      const resSnap = await getDocs(collection(db, 'organizations', user.uid, 'locations', caminId, 'residents'));
      const allRes = resSnap.docs.map(d => ({ cnp: d.id, ...d.data() } as Resident));
      setRoomResidents(allRes.filter(r => r.roomId === roomId));
      setUnassignedResidents(allRes.filter(r => !r.roomId));
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding resident:', error);
    }
  };

  const handleRemoveResident = async (residentCnp: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', residentCnp), {
        roomId: '',
        roomNumber: '',
      });

      const resSnap = await getDocs(collection(db, 'organizations', user.uid, 'locations', caminId, 'residents'));
      const allRes = resSnap.docs.map(d => ({ cnp: d.id, ...d.data() } as Resident));
      setRoomResidents(allRes.filter(r => r.roomId === roomId));
      setUnassignedResidents(allRes.filter(r => !r.roomId));
    } catch (error) {
      console.error('Error removing resident:', error);
    }
  };

  const handleMigrateResident = async (residentCnp: string) => {
    const user = auth.currentUser;
    if (!user || !migrateTargetRoom) return;

    try {
      if (migrateTargetLocation === caminId) {
        // Migrare in aceeasi locatie — doar update roomId
        await updateDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', residentCnp), {
          roomId: migrateTargetRoom,
          roomNumber: migrateRooms.find(r => r.id === migrateTargetRoom)?.roomNumber || '',
        });
      } else {
        // Migrare in alta locatie — trebuie sa mutam rezidentul in cealalta colectie
        const resDoc = await getDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', residentCnp));
        if (resDoc.exists()) {
          const resData = resDoc.data();
          // Scriem in noua locatie
          await setDoc(doc(db, 'organizations', user.uid, 'locations', migrateTargetLocation, 'residents', residentCnp), {
            ...resData,
            caminId: migrateTargetLocation,
            roomId: migrateTargetRoom,
            roomNumber: migrateRooms.find(r => r.id === migrateTargetRoom)?.roomNumber || '',
          });
          // Stergem din vechea locatie
          await deleteDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'residents', residentCnp));
        }
      }

      // Refresh
      const resSnap = await getDocs(collection(db, 'organizations', user.uid, 'locations', caminId, 'residents'));
      const allRes = resSnap.docs.map(d => ({ cnp: d.id, ...d.data() } as Resident));
      setRoomResidents(allRes.filter(r => r.roomId === roomId));
      setUnassignedResidents(allRes.filter(r => !r.roomId));
      setShowMigrateModal(null);
      setMigrateTargetRoom('');
    } catch (error) {
      console.error('Error migrating resident:', error);
      alert('Eroare la mutarea rezidentului');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4a]"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <p className="text-gray-500">Cameră negăsită</p>
      </div>
    );
  }

  const occupied = roomResidents.length;
  const available = room.capacity - occupied;
  const status = occupied === 0 ? 'available' : occupied < room.capacity ? 'partial' : 'occupied';
  const statusLabel = status === 'available' ? 'Disponibilă' : status === 'partial' ? 'Parțial ocupată' : 'Complet ocupată';
  const statusColor = status === 'available' ? 'bg-emerald-100 text-emerald-700' : status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-[#1a2b4a]">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/camine/${caminId}/rooms`)}
                className="flex items-center gap-2 text-white/70 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Camere</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Camera {room.roomNumber}
                  {room.isIsolator && (
                    <span className="ml-2 px-2 py-0.5 bg-[#c9a96e]/20 text-[#c9a96e] text-xs font-medium rounded-full">
                      IZOLATOR
                    </span>
                  )}
                </h1>
                <p className="text-white/40 text-xs">{room.floor} · {occupied}/{room.capacity} paturi ocupate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Info cameră */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#f5f5f0] rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Capacitate</p>
                <p className="text-lg font-semibold text-[#1a2b4a]">{room.capacity} paturi</p>
              </div>
              <div className="bg-[#f5f5f0] rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ocupate</p>
                <p className="text-lg font-semibold text-[#1a2b4a]">{occupied} paturi</p>
              </div>
              <div className="bg-[#f5f5f0] rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Rezidenți în cameră */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1a2b4a] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c9a96e]" />
                Rezidenți în cameră ({occupied}/{room.capacity})
              </h2>
              {available > 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2b4a] text-white rounded-lg text-sm font-medium hover:bg-[#243759] transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Adaugă rezident
                </button>
              )}
            </div>

            {roomResidents.length > 0 ? (
              <div className="space-y-3">
                {roomResidents.map(resident => (
                  <div
                    key={resident.cnp}
                    className="flex items-center justify-between p-3 bg-[#f5f5f0] rounded-lg border border-gray-200"
                  >
                    <div>
                      <Link
                        href={`/residents/${resident.beneficiarCnp || resident.cnp}`}
                        className="font-medium text-[#1a2b4a] hover:text-[#c9a96e] transition"
                      >
                        {resident.beneficiarNumeComplet}
                      </Link>
                      {resident.gradDependenta && (
                        <p className="text-xs text-gray-500 mt-0.5">Grad: {resident.gradDependenta}</p>
                      )}
                      {resident.dataInternare && (
                        <p className="text-xs text-gray-400">Internat: {resident.dataInternare}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMigrateTargetLocation(caminId);
                          setShowMigrateModal(resident.cnp);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a96e]/10 text-[#c9a96e] rounded-lg text-xs font-medium hover:bg-[#c9a96e]/20 transition"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Mută
                      </button>
                      <button
                        onClick={() => handleRemoveResident(resident.cnp)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Scoate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center">Niciun rezident în această cameră</p>
            )}

            {available <= 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-rose-600 font-medium">
                  Camera este complet ocupată ({occupied}/{room.capacity})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Adaugă rezident */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-[#1a2b4a]">Adaugă rezident în Camera {room.roomNumber}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              {unassignedResidents.length > 0 ? (
                <div className="space-y-2">
                  {unassignedResidents.map(resident => (
                    <button
                      key={resident.cnp}
                      onClick={() => handleAddResident(resident.cnp)}
                      className="w-full text-left p-3 bg-[#f5f5f0] rounded-lg border border-gray-200 hover:border-[#c9a96e]/40 transition"
                    >
                      <p className="font-medium text-[#1a2b4a] text-sm">{resident.beneficiarNumeComplet}</p>
                      <p className="text-xs text-gray-500">{resident.beneficiarCnp || resident.cnp}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">
                  Nu există rezidenți nealocați în această locație
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mută rezident */}
      {showMigrateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-[#1a2b4a]">Mută rezident</h3>
              <button onClick={() => setShowMigrateModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Locatie target */}
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">
                  Locație destinație
                </label>
                <select
                  value={migrateTargetLocation}
                  onChange={(e) => setMigrateTargetLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                >
                  {allLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Camera target */}
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">
                  Camera destinație
                </label>
                <select
                  value={migrateTargetRoom}
                  onChange={(e) => setMigrateTargetRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                >
                  <option value="">Selectează camera...</option>
                  {migrateRooms
                    .filter(r => r.id !== roomId || migrateTargetLocation !== caminId)
                    .map(r => (
                      <option key={r.id} value={r.id}>
                        Camera {r.roomNumber} ({r.capacity} paturi)
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={() => handleMigrateResident(showMigrateModal)}
                disabled={!migrateTargetRoom}
                className="w-full px-4 py-2.5 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition disabled:opacity-50 text-sm"
              >
                Confirmă mutarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
