// Doctor card component
// Displays doctor avatar, name, specialty, rating, fee, and availability

import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor = {} }) {
  const navigate = useNavigate();

  const {
    _id,
    name = 'Dr. A. Smith',
    specialty = 'General Physician',
    years = 8,
    rating = 4.7,
    fee = '₹500',
    available = true,
    verified = true,
    avatar = 'https://ui-avatars.com/api/?name=Dr+AS&background=2563EB&color=fff&rounded=true&size=128',
  } = doctor;

  const handleConsult = () => {
    navigate('/appointments/book', { state: { doctorId: _id } });
  };

  return (
    <article className="bg-white rounded-xl shadow-soft-md p-4 md:p-6 flex gap-4 items-center hover:shadow-lg transition">
      <img src={avatar} alt={`${name} avatar`} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="truncate">
            <h3 className="text-base md:text-lg font-semibold text-neutral-900 truncate">{name} {verified && <span className="ml-2 inline-block text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full align-middle">Verified</span>}</h3>
            <p className="text-sm text-neutral-600 mt-1 truncate">{specialty} • {years} yrs</p>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-neutral-900">{fee}</div>
            <div className="text-xs text-neutral-500">Consult</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-neutral-600">
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.173L12 18.896 4.664 23.17l1.402-8.173L.132 9.21l8.2-1.192z"/></svg>
              <span className="font-medium">{rating}</span>
              <span className="text-xs text-neutral-400">(120)</span>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${available ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'}`}>{available ? 'Online' : 'Offline'}</div>
          </div>

          <div>
            <button onClick={handleConsult} className="bg-gradient-to-r from-primary-500 to-secondary-400 text-white px-4 py-2 rounded-lg shadow-sm text-sm hover:opacity-95">Consult Now</button>
          </div>
        </div>
      </div>
    </article>
  );
}
