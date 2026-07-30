'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ROOMS_BY_LOCATION } from '@/lib/rooms-data';
import { ArrowLeft, Building, Bed, Users, Search, Plus, Settings, Trash2, X, Minus, Loader2 } from 'lucide-react';

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
  roomId?: string;
  roomNumber?: string;
}

export default function RoomsPage() {
  const router = useRouter();
  const params = useParams();
  const caminId = params.id as string;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState(2);
  const [newRoomFloor, setNewRoomFloor] = useState('Parter');
  const [newRoomIsolator, setNewRoomIsolator] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
        return;
      }

      try {
        // Verificam daca exista camere in Firestore
        const roomsRef = collection(db, 'organizations', user.uid, 'locations', caminId, 'rooms');
        const roomsSnap = await getDocs(roomsRef);

        let roomsList: Room[] = [];

        if (roomsSnap.empty) {
          // Auto-creare camere pe baza datelor statice
          const initialRooms = ROOMS_BY_LOCATION[caminId] || [];
          for (const room of initialRooms) {
            const roomId = `room-${room.roomNumber}`;
            await setDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'rooms', roomId), {
              roomNumber: room.roomNumber,
              capacity: room.capacity,
              floor: room.floor,
              isIsolator: room.isIsolator || false,
              createdAt: Date.now(),
            });
            roomsList.push({
              id: roomId,
              roomNumber: room.roomNumber,
              capacity: room.capacity,
              floor: room.floor,
              isIsolator: room.isIsolator,
            });
          }
        } else {
          roomsList = roomsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Room));
        }

        setRooms(roomsList.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber)));

        // Incarcam rezidentii
        const resRef = collection(db, 'organizations', user.uid, 'locations', caminId, 'residents');
        const resSnap = await getDocs(resRef);
        const resList = resSnap.docs.map(d => ({ cnp: d.id, ...d.data() } as Resident));
        setResidents(resList);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caminId, router]);

  // Rezidentii per camera
  const getRoomResidents = (roomId: string) => {
    return residents.filter(r => r.roomId === roomId);
  };

  const getRoomStatus = (room: Room) => {
    const count = getRoomResidents(room.id).length;
    if (count === 0) return 'available';
    if (count < room.capacity) return 'partial';
    return 'occupied';
  };

  const handleSaveRoom = async () => {
    const user = auth.currentUser;
    if (!user || !newRoomNumber) return;

    setSavingRoom(true);
    try {
      const roomId = `room-${newRoomNumber}`;
      const roomData = {
        roomNumber: newRoomNumber,
        capacity: newRoomCapacity,
        floor: newRoomFloor,
        isIsolator: newRoomIsolator,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'rooms', roomId), roomData, { merge: true });

      // Update local state
      const existing = rooms.find(r => r.id === roomId);
      if (existing) {
        setRooms(rooms.map(r => r.id === roomId ? { ...r, ...roomData } : r));
      } else {
        setRooms([...rooms, { id: roomId, ...roomData } as Room].sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber)));
      }

      setShowAddRoomModal(false);
      setEditRoomId(null);
      setNewRoomNumber('');
      setNewRoomCapacity(2);
      setNewRoomFloor('Parter');
      setNewRoomIsolator(false);
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Eroare la salvarea camerei');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditRoomId(room.id);
    setNewRoomNumber(room.roomNumber);
    setNewRoomCapacity(room.capacity);
    setNewRoomFloor(room.floor);
    setNewRoomIsolator(room.isIsolator || false);
    setShowAddRoomModal(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const roomRes = getRoomResidents(roomId);
    if (roomRes.length > 0) {
      alert(`Nu poți șterge camera — are ${roomRes.length} rezidenți alocați. Mută rezidenții întâi.`);
      return;
    }

    try {
      await deleteDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'rooms', roomId));
      setRooms(rooms.filter(r => r.id !== roomId));
      setDeleteRoomId(null);
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Eroare la ștergerea camerei');
    }
  };

  const handleCapacityChange = async (roomId: string, newCapacity: number) => {
    const user = auth.currentUser;
    if (!user || newCapacity < 1) return;

    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const occupied = getRoomResidents(roomId).length;
    if (newCapacity < occupied) {
      alert(`Nu poți reduce capacitatea sub ${occupied} — sunt ${occupied} rezidenți în cameră.`);
      return;
    }

    try {
      await updateDoc(doc(db, 'organizations', user.uid, 'locations', caminId, 'rooms', roomId), {
        capacity: newCapacity,
      });
      setRooms(rooms.map(r => r.id === roomId ? { ...r, capacity: newCapacity } : r));
    } catch (error) {
      console.error('Error updating capacity:', error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const status = getRoomStatus(room);
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const roomRes = getRoomResidents(room.id);
      if (room.roomNumber.includes(searchTerm)) return true;
      if (roomRes.some(r => r.beneficiarNumeComplet.toLowerCase().includes(term))) return true;
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4a]"></div>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    available: 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/40',
    partial: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40',
    occupied: 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/40',
  };

  const statusLabels: Record<string, string> = {
    available: 'Disponibilă',
    partial: 'Parțial',
    occupied: 'Ocupată',
  };

  // Grupam pe etaj
  const floors = [...new Set(rooms.map(r => r.floor))].sort();

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-[#1a2b4a]">
        <div className="max-w-none mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/camine/${caminId}`)}
                className="flex items-center gap-2 text-white/70 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Înapoi</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Distribuție Camere</h1>
                <p className="text-white/40 text-xs">{rooms.length} camere · {residents.length} rezidenți</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManageModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition"
              >
                <Settings className="w-4 h-4" />
                Gestionează
              </button>
              <button
                onClick={() => {
                  setEditRoomId(null);
                  setNewRoomNumber('');
                  setNewRoomCapacity(2);
                  setNewRoomFloor('Parter');
                  setNewRoomIsolator(false);
                  setShowAddRoomModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#c9a96e] text-white rounded-lg text-sm font-medium hover:bg-[#b8985e] transition"
              >
                <Plus className="w-4 h-4" />
                Adaugă Cameră
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-none mx-auto px-4 sm:px-6 py-8">
        {/* Filtre */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</span>
              <div className="flex gap-1">
                {[
                  { val: 'all', label: 'Toate' },
                  { val: 'available', label: 'Libere' },
                  { val: 'partial', label: 'Parțial' },
                  { val: 'occupied', label: 'Ocupate' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setFilterStatus(val)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                      filterStatus === val
                        ? 'bg-[#1a2b4a] border-[#1a2b4a] text-white'
                        : 'bg-transparent border-gray-300 text-gray-600 hover:border-[#1a2b4a]/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Caută cameră sau rezident..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
              />
            </div>

            <div className="text-sm text-gray-500">
              <span className="font-bold text-[#1a2b4a]">{filteredRooms.length}</span> camere
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-5 mb-6 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Legendă</span>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 shadow-sm" />
            <span className="text-xs font-medium text-gray-600">Disponibil</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm" />
            <span className="text-xs font-medium text-gray-600">Parțial ocupat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-rose-500 to-red-600 shadow-sm" />
            <span className="text-xs font-medium text-gray-600">Complet ocupat</span>
          </div>
          <span className="ml-auto text-xs text-gray-400">● ocupat &nbsp; ○ liber</span>
        </div>

        {/* Grid pe etaje */}
        <div className="space-y-4">
          {floors.map(floorName => {
            const floorRooms = filteredRooms.filter(r => r.floor === floorName);
            if (floorRooms.length === 0) return null;

            return (
              <div
                key={floorName}
                className="bg-[#1a2b4a] rounded-2xl shadow-lg border border-white/5 overflow-hidden"
              >
                {/* Header etaj */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-white/5">
                  <div className="w-1.5 h-8 rounded-full bg-[#c9a96e]" />
                  <span className="text-sm font-bold tracking-wider uppercase text-white">{floorName}</span>
                  <span className="text-xs text-white/40">{floorRooms.length} camere</span>
                </div>

                {/* Camere */}
                <div className="p-5 flex flex-wrap gap-3">
                  {floorRooms.map(room => {
                    const roomRes = getRoomResidents(room.id);
                    const status = getRoomStatus(room);
                    const occupied = roomRes.length;
                    const available = room.capacity - occupied;

                    return (
                      <Link
                        key={room.id}
                        href={`/camine/${caminId}/rooms/${room.id}`}
                        className="block"
                        onMouseEnter={(e) => showRoomTooltip(e, room, roomRes)}
                        onMouseLeave={hideRoomTooltip}
                      >
                        <div
                          className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all duration-150 hover:scale-105 hover:shadow-xl cursor-pointer ${statusStyles[status]}`}
                        >
                          <span className="text-white text-base font-bold leading-none">
                            {room.roomNumber}
                          </span>
                          <div className="flex gap-1 mt-1.5">
                            {Array.from({ length: room.capacity }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < occupied ? 'bg-white/90' : 'bg-white/25'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-white/75 text-[10px] font-medium mt-1">
                            {available}/{room.capacity}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredRooms.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Nicio cameră găsită</p>
          </div>
        )}
      </div>

      {/* Modal: Adaugă / Editează Cameră */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-[#1a2b4a]">
                {editRoomId ? `Editează Camera ${newRoomNumber}` : 'Adaugă Cameră Nouă'}
              </h3>
              <button onClick={() => { setShowAddRoomModal(false); setEditRoomId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">
                  Număr cameră
                </label>
                <input
                  type="text"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  disabled={!!editRoomId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="ex: 15"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">
                  Capacitate (paturi)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">
                  Etaj
                </label>
                <select
                  value={newRoomFloor}
                  onChange={(e) => setNewRoomFloor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#1a2b4a] focus:ring-2 focus:ring-[#1a2b4a]/10 transition text-sm"
                >
                  <option value="Parter">Parter</option>
                  <option value="Etaj 1">Etaj 1</option>
                  <option value="Etaj 2">Etaj 2</option>
                  <option value="Etaj 3">Etaj 3</option>
                  <option value="Mansardă">Mansardă</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRoomIsolator}
                  onChange={(e) => setNewRoomIsolator(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1a2b4a] focus:ring-[#1a2b4a]/20"
                />
                <span className="text-sm text-gray-700">Izolator</span>
              </label>
              <button
                onClick={handleSaveRoom}
                disabled={savingRoom || !newRoomNumber}
                className="w-full px-4 py-2.5 bg-[#1a2b4a] text-white rounded-lg font-medium hover:bg-[#243759] transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {savingRoom ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Se salvează...</>
                ) : (
                  <>{editRoomId ? 'Salvează modificările' : 'Adaugă Camera'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gestionează Camere */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-[#1a2b4a]">Gestionează Camere ({rooms.length})</h3>
              <button onClick={() => { setShowManageModal(false); setDeleteRoomId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <div className="space-y-2">
                {rooms.map(room => {
                  const occupied = getRoomResidents(room.id).length;
                  return (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 bg-[#f5f5f0] rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a2b4a] rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{room.roomNumber}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1a2b4a]">
                            Camera {room.roomNumber} · {room.floor}
                            {room.isIsolator && (
                              <span className="ml-2 px-1.5 py-0.5 bg-[#c9a96e]/20 text-[#c9a96e] text-[10px] font-medium rounded">IZOLATOR</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{occupied}/{room.capacity} paturi ocupate</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Capacitate +/- */}
                        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200">
                          <button
                            onClick={() => handleCapacityChange(room.id, room.capacity - 1)}
                            disabled={room.capacity <= 1 || occupied >= room.capacity}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg disabled:opacity-30 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold text-[#1a2b4a] w-6 text-center">{room.capacity}</span>
                          <button
                            onClick={() => handleCapacityChange(room.id, room.capacity + 1)}
                            disabled={room.capacity >= 10}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg disabled:opacity-30 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="px-2.5 py-1.5 bg-[#1a2b4a]/10 text-[#1a2b4a] rounded-lg text-xs font-medium hover:bg-[#1a2b4a]/20 transition"
                        >
                          Editează
                        </button>
                        {deleteRoomId === room.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition"
                            >
                              Confirmă
                            </button>
                            <button
                              onClick={() => setDeleteRoomId(null)}
                              className="px-2.5 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-300 transition"
                            >
                              Anulează
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteRoomId(room.id)}
                            className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setEditRoomId(null);
                  setNewRoomNumber('');
                  setNewRoomCapacity(2);
                  setNewRoomFloor('Parter');
                  setNewRoomIsolator(false);
                  setShowAddRoomModal(true);
                }}
                className="w-full px-4 py-2.5 bg-[#c9a96e] text-white rounded-lg font-medium hover:bg-[#b8985e] transition text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adaugă Cameră Nouă
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip rezidenți */}
      <div
        id="room-tooltip"
        className="fixed z-50 hidden bg-[#1e293b] border border-white/10 rounded-xl p-3 min-w-[220px] max-w-[300px] shadow-2xl pointer-events-none"
      />
    </div>
  );
}

function showRoomTooltip(e: React.MouseEvent, room: Room, residents: Resident[]) {
  const tooltip = document.getElementById('room-tooltip');
  if (!tooltip) return;

  if (residents.length === 0) {
    tooltip.innerHTML = '<p style="color:rgba(255,255,255,.5);font-size:12px;text-align:center;padding:4px 0;">Niciun rezident alocat</p>';
  } else {
    let html = '<p style="color:#c9a96e;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">Camera ' + room.roomNumber + ' — ' + residents.length + ' rezident' + (residents.length !== 1 ? 'i' : '') + '</p>';
    html += '<div style="display:flex;flex-direction:column;gap:5px;">';
    residents.forEach(r => {
      html += '<span style="color:#fff;font-size:12px;font-weight:500;">' + r.beneficiarNumeComplet + '</span>';
    });
    html += '</div>';
    tooltip.innerHTML = html;
  }

  tooltip.style.display = 'block';
  positionTooltip(e, tooltip);
}

function hideRoomTooltip() {
  const tooltip = document.getElementById('room-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

function positionTooltip(e: React.MouseEvent, tooltip: HTMLElement) {
  const margin = 12;
  let x = e.clientX + margin;
  let y = e.clientY + margin;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  requestAnimationFrame(() => {
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth - margin) x = e.clientX - rect.width - margin;
    if (rect.bottom > window.innerHeight - margin) y = e.clientY - rect.height - margin;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  });
}
