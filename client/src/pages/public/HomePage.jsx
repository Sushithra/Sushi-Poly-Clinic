import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
	const navigate = useNavigate();

	const doctorsShowcase = [
		{
			_id: 'dwarakanath',
			name: 'Dr. Dwarakanath',
			specialty: 'General Medicine',
			rating: 4.7,
		},
		{
			_id: 'manisha-psychology',
			name: 'Dr. Manisha',
			specialty: 'Clinical Psychology',
			rating: 4.8,
		},
		{
			_id: 'manisha-nutrition',
			name: 'Dr. Manisha',
			specialty: 'Nutrition Consultation',
			rating: 4.8,
		},
	];

	const conditions = [
		"Diabetes", "High Blood Pressure", "Joint Pain", "Digestion Disorders", 
		"Skin Diseases", "Kidney Stone", "Piles", "Gallbladder Stone", 
		"Headache", "Nerve Disease (Diabetic Neuropathy)", "Tumors/ Cancer Diseases",
		"Thyroid Problems", "Male Infertility", "Women's Diseases", "Infertility",
		"Hypertension", "Heart Diseases", "Lung Disorders", "Obesity", "Autoimmune Diseases"
	];

	return (
		<div className="space-y-12 pb-12">
			{/* HERO SECTION - Herbal / Electropathy Theme */}
			<section className="bg-gradient-to-br from-green-900 to-emerald-800 rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-2xl text-white">
				{/* Background decorative elements */}
				<div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
				<div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-400 opacity-10 blur-3xl"></div>
				
				<div className="relative z-10 text-center max-w-4xl mx-auto">
					<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-yellow-400 mb-4 drop-shadow-md">
						Sushi Poly Clinic
					</h1>
					<p className="text-xl md:text-2xl font-medium tracking-widest text-emerald-100 uppercase border-y border-emerald-600/50 py-3 mb-8">
						Electropathy – The Future of Herbal Medicine
					</p>

					<p className="text-lg md:text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed mb-6 font-light">
						Electropathy is a holistic herbal-based medical system that is free of side effects and helps restore the body's natural state. The clinic aims to benefit people from all walks of life.
					</p>
					
					<div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
						<Link 
							to="/login"
							className="inline-block bg-emerald-700/50 hover:bg-emerald-700 border border-emerald-500/50 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105 backdrop-blur-sm"
						>
							Login
						</Link>
					</div>
				</div>
			</section>

			{/* CONDITIONS TREATED */}
			<section className="bg-green-50 rounded-2xl p-8 shadow-inner border border-green-100">
				<div className="inline-block bg-gradient-to-r from-green-800 to-green-600 text-white px-6 py-2 rounded-r-full -ml-8 mb-8 shadow-md font-bold text-lg">
					Conditions Treated Include:
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
					{conditions.map((condition, index) => (
						<div key={index} className="flex items-start gap-2">
							<svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
							<span className="text-neutral-700 font-medium">{condition}</span>
						</div>
					))}
				</div>
				<div className="mt-8 text-center text-green-800 font-bold text-lg border-t border-green-200/60 pt-6">
					Excellent treatment for all types of chronic illnesses.
				</div>
			</section>
		</div>
	);
}
