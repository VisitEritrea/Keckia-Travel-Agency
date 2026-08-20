import React, { useRef, useState } from 'react';
import {
  X,
  UserPlus,
  Printer,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  CreditCard,
  HeartPulse,
  Shirt,
  ShieldCheck,
  FileCheck,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Camera,
  Loader2,
  CheckSquare,
  Square,
  Building,
  Download,
} from 'lucide-react';
import {
  Department,
  Employee,
  EmployeeOnboardingData,
  SalaryTier,
  StaffRole,
  StaffStatus,
} from '../../types';
import { printElement, exportElementAsHTML } from '../../utils/exportUtils';
import { readAndCompressImage } from '../../utils/imageUpload';

interface AddEmployeeModalProps {
  departments?: Department[];
  onClose: () => void;
  onAddEmployee: (newEmployee: Employee) => void;
}


export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  departments = [],
  onClose,
  onAddEmployee,
}) => {
  // Only the departments actually stored in the workspace are offered — a
  // cleared workspace shows none rather than inventing sample ones.
  const deptList = departments ?? [];

  // Active page state: 1 to 6, or 'all' for print / full view
  const [activePage, setActivePage] = useState<number | 'all'>(1);

  // --- Page 1 State: Profile & Personal ---
  const [employeeId, setEmployeeId] = useState(`EV-EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [employmentStatus, setEmploymentStatus] = useState<'Permanent' | 'Contract' | 'Temporary' | 'Internship' | 'Part-Time'>('Permanent');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(['Tour Guide', 'Tour Operations']);
  const [deptOther, setDeptOther] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Expedition Lead & Naturalist');
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);
  const [reportingManager, setReportingManager] = useState('Dawit Haile (Director of Field Ops)');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFile = async (file: File | null | undefined) => {
    if (!file) return;
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      setPhotoUrl(await readAndCompressImage(file));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not read that image.');
    } finally {
      setPhotoBusy(false);
    }
  };

  // Personal Info
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dob, setDob] = useState('1992-06-15');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');
  const [nationality, setNationality] = useState('Eritrean');
  const [nationalIdNo, setNationalIdNo] = useState('ER-4910283');
  const [passportNumber, setPassportNumber] = useState('ER-9821034');
  const [passportExpiry, setPassportExpiry] = useState('2031-10-24');
  const [drivingLicenseNo, setDrivingLicenseNo] = useState('ASM-DL-88219');
  const [dependentsCount, setDependentsCount] = useState<number>(0);
  const [placeOfBirth, setPlaceOfBirth] = useState('Asmara');
  const [countryOfBirth, setCountryOfBirth] = useState('Eritrea');
  const [languagesSpoken, setLanguagesSpoken] = useState('Tigrinya, English, Italian, Arabic');

  // --- Page 2 State: Contact, Emergency & Family ---
  const [residentialAddress, setResidentialAddress] = useState('Maryam Gimbi Street, Zone 04, Villa 12');
  const [city, setCity] = useState('Asmara');
  const [region, setRegion] = useState('Maekel (Central)');
  const [postalCode, setPostalCode] = useState('1200');
  const [country, setCountry] = useState('Eritrea');
  const [mobileNumber, setMobileNumber] = useState('+291 91 123 4567');
  const [altPhone, setAltPhone] = useState('+291 1 124 589');
  const [personalEmail, setPersonalEmail] = useState('');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('Senait Tesfay');
  const [emergencyRelation, setEmergencyRelation] = useState('Sister');
  const [emergencyPhone, setEmergencyPhone] = useState('+291 91 765 4321');
  const [emergencyAddress, setEmergencyAddress] = useState('Gejeret Sub-district, Asmara');

  // Family Information Table
  const [familyRows, setFamilyRows] = useState([
    { relationship: 'Spouse', name: '', occupation: '', contact: '' },
    { relationship: 'Child', name: '', occupation: '', contact: '' },
    { relationship: 'Child', name: '', occupation: '', contact: '' },
    { relationship: 'Parent', name: 'Haile Tesfay', occupation: 'Retired Educator', contact: '+291 91 222 3333' },
    { relationship: 'Parent', name: 'Almaz Berhe', occupation: 'Homemaker', contact: '+291 91 444 5555' },
  ]);

  // --- Page 3 State: Education, Qualifications & History ---
  const [educationRows, setEducationRows] = useState([
    { qualification: 'Secondary School', institution: 'Asmara Comprehensive High School', country: 'Eritrea', yearCompleted: '2010' },
    { qualification: 'Diploma', institution: 'National Tourism & Hospitality Training Institute', country: 'Eritrea', yearCompleted: '2013' },
    { qualification: "Bachelor's Degree", institution: 'University of Asmara / EIT', country: 'Eritrea', yearCompleted: '2017' },
    { qualification: "Master's Degree", institution: '', country: '', yearCompleted: '' },
    { qualification: 'Other', institution: 'East African Wilderness Guide Academy', country: 'Kenya / Regional', yearCompleted: '2019' },
  ]);

  // Professional Qualifications
  const [certifications, setCertifications] = useState<string[]>([
    'Certified National Tourism & Natural Heritage Guide (Level III)',
    'Wilderness First Responder (WFR) - Red Cross / WMA International',
    'IATA Travel & Tourism Professional Foundation',
    'Advanced High-Altitude Navigation & GPS Expedition Logistics',
  ]);
  const [profLanguages, setProfLanguages] = useState<string[]>(['English', 'Tigrinya', 'Arabic', 'Italian']);
  const [otherProfLanguage, setOtherProfLanguage] = useState('');
  const [computerSkills, setComputerSkills] = useState<string[]>([
    'MS Office',
    'Google Workspace',
    'Reservation Systems',
    'Amadeus',
    'Canva',
    'Social Media Management',
  ]);
  const [otherComputerSkill, setOtherComputerSkill] = useState('');

  // Employment History
  const [employmentHistory, setEmploymentHistory] = useState([
    { employer: 'Red Sea Expeditionary Tours', position: 'Field Expedition Guide', durationFrom: '2018', durationTo: '2022', reasonForLeaving: 'Career Advancement' },
    { employer: 'Asmara Heritage Travel Bureau', position: 'Ticketing & Operations Agent', durationFrom: '2014', durationTo: '2018', reasonForLeaving: 'Pursued Field Operations' },
  ]);

  // --- Page 4 State: Experience, Bank, Tax, Medical & Equipment ---
  const [yearsExperience, setYearsExperience] = useState('5 – 10 Years');
  const [tourismAreas, setTourismAreas] = useState<string[]>([
    'Tour Guiding',
    'Tour Planning',
    'Visa Processing',
    'Hotel Reservations',
    'Transport Coordination',
  ]);
  const [otherTourismArea, setOtherTourismArea] = useState('');

  // Bank Info
  const [bankName, setBankName] = useState('Commercial Bank of Eritrea');
  const [bankBranch, setBankBranch] = useState('Harnet Avenue Central Branch, Asmara');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('108-49201-9921');
  const [iban, setIban] = useState('ER92CBER0000108492019921');

  // Tax & Social Security
  const [tin, setTin] = useState('TIN-98102934');
  const [socialSecurityNo, setSocialSecurityNo] = useState('SSN-ER-449102');

  // Medical Info
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [knownAllergies, setKnownAllergies] = useState('None');
  const [medicalConditions, setMedicalConditions] = useState('None');
  const [specialAssistance, setSpecialAssistance] = useState('None required (Physically fit for alpine & desert terrain)');

  // Equipment Issued
  const [equipmentRows, setEquipmentRows] = useState([
    { item: 'Laptop', serialNo: 'EV-LT-8812', dateIssued: new Date().toISOString().split('T')[0], returned: false },
    { item: 'ID Card', serialNo: 'EV-ID-9941', dateIssued: new Date().toISOString().split('T')[0], returned: false },
    { item: 'Mobile Phone', serialNo: 'EV-PH-2041', dateIssued: new Date().toISOString().split('T')[0], returned: false },
    { item: 'Uniform', serialNo: 'EV-UNF-24', dateIssued: new Date().toISOString().split('T')[0], returned: false },
    { item: 'Keys', serialNo: 'EV-KEY-HUB-04', dateIssued: new Date().toISOString().split('T')[0], returned: false },
    { item: 'Other (Garmin InReach GPS)', serialNo: 'GARMIN-IN-992', dateIssued: new Date().toISOString().split('T')[0], returned: false },
  ]);

  // --- Page 5 State: Uniform, Other & Declaration ---
  const [shirtSize, setShirtSize] = useState('L');
  const [jacketSize, setJacketSize] = useState('L');
  const [trouserSize, setTrouserSize] = useState('32 / 34');
  const [shoeSize, setShoeSize] = useState('42 (EU)');

  // Other info
  const [hobbies, setHobbies] = useState('Alpine trekking, wildlife photography, archaeology, historical architecture');
  const [memberships, setMemberships] = useState('Eritrean Tour Guides Association (ETGA), African Ecotourism Society');
  const [awards, setAwards] = useState('Best Cultural Expedition Leader 2024 (Ministry of Tourism Commendation)');
  const [hearAboutUs, setHearAboutUs] = useState('Official EritreaVisit Website & Industry Referral');

  // Declaration
  const [declarationSigned, setDeclarationSigned] = useState(true);
  const [employeeSignature, setEmployeeSignature] = useState('');
  const [declarationDate, setDeclarationDate] = useState(new Date().toISOString().split('T')[0]);

  // HR Use Only (Page 5 bottom)
  const [hrDateReceived, setHrDateReceived] = useState(new Date().toISOString().split('T')[0]);
  const [hrOfficer, setHrOfficer] = useState('Martha Kibreab (Senior HR Compliance Officer)');
  const [hrAssignedDept, setHrAssignedDept] = useState('Licensed Tour Guides');
  // Role and compensation -- every hire used to be saved as an identical
  // Tier 1 / $4,200 "Senior Lead" regardless of what was actually agreed,
  // which fed a fabricated number straight into the payroll KPI.
  const [staffRole, setStaffRole] = useState<StaffRole>('Agent');
  const [salaryTier, setSalaryTier] = useState<SalaryTier>('Tier 3 - Associate');
  const [salaryAmount, setSalaryAmount] = useState<number | ''>(1800);

  // --- Page 6 State: HR Verification & Onboarding ---
  const [docsReceived, setDocsReceived] = useState<string[]>([
    'National ID',
    'Passport',
    'CV',
    'Academic Certificates',
    'Professional Certificates',
    'Reference Letters',
    'Police Clearance',
    'Medical Certificate',
    'Bank Details',
    'Passport Photos',
  ]);
  const [otherDoc, setOtherDoc] = useState('');
  const [educationVerified, setEducationVerified] = useState(true);
  const [referenceCheckCompleted, setReferenceCheckCompleted] = useState(true);
  const [criminalRecordCleared, setCriminalRecordCleared] = useState(true);
  const [medicalExamDone, setMedicalExamDone] = useState(true);
  const [documentsVerified, setDocumentsVerified] = useState(true);
  const [hrRemarks, setHrRemarks] = useState('Candidate is thoroughly vetted with impeccable alpine guiding credentials and clear consular clearances. Recommended for Senior Expedition Lead designation.');
  const [reviewedBy, setReviewedBy] = useState('Yonas Ghebre (Operations Lead)');
  const [hrManager, setHrManager] = useState('Martha Kibreab (HR Director)');
  const [approvalDate, setApprovalDate] = useState(new Date().toISOString().split('T')[0]);
  const [approvalSignature, setApprovalSignature] = useState('M. Kibreab');

  // Orientation & Onboarding checklist
  const [orientationDone, setOrientationDone] = useState(true);
  const [orientationDate, setOrientationDate] = useState(new Date().toISOString().split('T')[0]);
  const [payrollDone, setPayrollDone] = useState(true);
  const [payrollDate, setPayrollDate] = useState(new Date().toISOString().split('T')[0]);
  const [emailDone, setEmailDone] = useState(true);
  const [emailDate, setEmailDate] = useState(new Date().toISOString().split('T')[0]);
  const [idDone, setIdDone] = useState(true);
  const [idDate, setIdDate] = useState(new Date().toISOString().split('T')[0]);

  // Quick auto-fill sample helper
  const handleAutoFillSample = () => {
    setFullName('Bereket Habte');
    setPreferredName('Bereket');
    setPersonalEmail('b.habte@eritreavisit.com');
    setAccountName('Bereket Habte');
    setEmployeeSignature('Bereket Habte');
    setMobileNumber('+291 91 482 9102');
    setDob('1991-04-18');
    setJobTitle('Senior Expedition Lead & Naturalist');
    setLanguagesSpoken('Tigrinya, English, Italian, Arabic');
  };

  // Submit Handler
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = fullName.trim() || 'New Staff Member';
    const finalEmail = personalEmail.trim() || `${finalName.toLowerCase().replace(/\s+/g, '.')}@eritreavisit.com`;

    // Map department to existing or custom
    const matchedDept = deptList.find((d) =>
      d.name.toLowerCase().includes(selectedDepartments[0]?.toLowerCase() || '') ||
      d.id === 'dept-guides'
    ) || deptList[0];

    const onboardingData: EmployeeOnboardingData = {
      profile: {
        employeeId,
        formDate,
        employmentStatus,
        departments: selectedDepartments,
        departmentOther: deptOther,
        jobTitle,
        dateOfJoining,
        reportingManager,
        photoUrl,
      },
      personal: {
        fullName: finalName,
        preferredName,
        dob,
        nationality,
        nationalIdNo,
        passportNumber,
        passportExpiry,
        drivingLicenseNo,
        gender,
        maritalStatus,
        dependentsCount,
        placeOfBirth,
        countryOfBirth,
        languagesSpoken,
      },
      contact: {
        residentialAddress,
        city,
        region,
        postalCode,
        country,
        mobileNumber,
        altPhone,
        personalEmail: finalEmail,
      },
      emergency: {
        fullName: emergencyName,
        relationship: emergencyRelation,
        telephone: emergencyPhone,
        address: emergencyAddress,
      },
      family: familyRows,
      education: educationRows,
      qualifications: {
        certifications,
        languages: profLanguages,
        computerSkills,
        otherLanguage: otherProfLanguage,
        otherSkill: otherComputerSkill,
      },
      employmentHistory,
      experience: {
        yearsOfExperience: yearsExperience,
        areasOfExperience: tourismAreas,
        otherExperience: otherTourismArea,
      },
      bank: {
        bankName,
        branch: bankBranch,
        accountName: accountName || finalName,
        accountNumber,
        iban,
      },
      taxSocialSecurity: {
        tin,
        socialSecurityNo,
      },
      medical: {
        bloodGroup,
        knownAllergies,
        medicalConditions,
        specialAssistance,
      },
      equipmentIssued: equipmentRows,
      uniform: {
        shirtSize,
        jacketSize,
        trouserSize,
        shoeSize,
      },
      other: {
        hobbies,
        memberships,
        awards,
        hearAboutUs,
      },
      declaration: {
        signed: declarationSigned,
        employeeSignature: employeeSignature || finalName,
        date: declarationDate,
      },
      hrUseOnly: {
        dateReceived: hrDateReceived,
        employeeIdAssigned: employeeId,
        hrOfficer,
        department: hrAssignedDept,
      },
      hrVerification: {
        documentsReceived: docsReceived,
        otherDocument: otherDoc,
        educationVerified,
        referenceCheckCompleted,
        criminalRecordCleared,
        medicalExamDone,
        documentsVerified,
        remarks: hrRemarks,
        reviewedBy,
        hrManager,
        approvalDate,
        approvalSignature,
      },
      onboardingChecklist: {
        orientationCompleted: { done: orientationDone, date: orientationDate },
        payrollAdded: { done: payrollDone, date: payrollDate },
        emailCreated: { done: emailDone, date: emailDate },
        idIssued: { done: idDone, date: idDate },
      },
    };

    const newEmp: Employee = {
      id: employeeId || `emp-${Date.now().toString().slice(-4)}`,
      name: finalName,
      role: staffRole,
      email: finalEmail,
      phone: mobileNumber,
      departmentId: matchedDept?.id || '',
      departmentName: matchedDept?.name || selectedDepartments[0] || deptOther || 'Unassigned',
      salaryTier,
      salaryAmount: Number(salaryAmount) || 0,
      hireDate: dateOfJoining || new Date().toISOString().split('T')[0],
      status: 'Active' as StaffStatus,
      avatar: photoUrl,
      rating: 5.0,
      languages: profLanguages.length > 0 ? profLanguages : languagesSpoken.split(',').map((s) => s.trim()),
      assignedToursCount: 0,
      emergencyContact: {
        name: emergencyName || 'Next of Kin',
        relation: emergencyRelation || 'Family',
        phone: emergencyPhone || mobileNumber,
      },
      documents: docsReceived.map((doc, idx) => ({
        id: `doc-onboard-${idx + 1}`,
        title: `${doc} Verification Copy`,
        type: doc.includes('Passport') || doc.includes('ID') ? 'ID Passport' : doc.includes('Certificate') ? 'Certification' : 'Contract',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: '1.4 MB',
      })),
      specialties: certifications.slice(0, 3),
      recentLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'Completed Full 6-Page EritreaVisit HR Onboarding',
          timestamp: 'Just now',
          user: hrOfficer || 'HR Department',
        },
      ],
      onboardingData,
    };

    onAddEmployee(newEmp);
    onClose();
  };

  const handlePrint = () => {
    printElement('printable-eritreavisit-form', `EritreaVisit_Onboarding_${employeeId || 'Staff'}`);
  };

  const handleDownloadHTML = () => {
    exportElementAsHTML(
      'printable-eritreavisit-form',
      `EritreaVisit_Onboarding_${employeeId || 'Staff'}.html`,
      `EritreaVisit Employee Onboarding Document - ${fullName || employeeId}`
    );
  };

  // Toggle helper for arrays
  const toggleArrayItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Shared Form Header (The official ERITREAVISIT Artwork banner)
  const renderOfficialHeader = (pageNumber: number) => (
    <div className="bg-white border-b border-slate-200 p-5 sm:p-7 relative overflow-hidden select-none">
      {/* Top Banner: Logo & Asmara Landmarks Artwork Representation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        {/* Logo Section */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex flex-col items-center justify-center text-center p-1">
              <div className="w-4 h-5 border-2 border-amber-600 rounded-t-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-sky-600 rounded-full animate-pulse" />
              </div>
              <div className="w-7 h-1.5 bg-gradient-to-r from-amber-500 to-sky-600 rounded-full mt-1" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-[#DC4116] font-sans">ERITREA</span>
              <span className="text-2xl font-black tracking-tight text-[#0870A2] font-sans">VISIT</span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 font-mono">
              EXPERIENCE • EXPLORE • REMEMBER
            </p>
          </div>
        </div>

        {/* Asmara Art & Architectural Landmarks Graphic Card */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/70 shadow-2xs">
          <Building className="w-6 h-6 text-amber-700 shrink-0" />
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-800 tracking-tight block">
              UNESCO World Heritage City: Asmara
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              Futurist & Art Deco Architectural Capital of Africa
            </span>
          </div>
        </div>
      </div>

      {/* Form Title & HR Department Badge */}
      <div className="pt-5 text-center relative">
        <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#134E6F] uppercase">
          EMPLOYEE INFORMATION FORM
        </h1>
        <div className="inline-flex items-center gap-2 mt-2 px-5 py-1 rounded-full bg-[#134E6F] text-white text-xs font-bold uppercase tracking-widest shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>HUMAN RESOURCES DEPARTMENT</span>
        </div>
      </div>
    </div>
  );

  // Shared Form Footer
  const renderOfficialFooter = (pageNumber: number | string) => (
    <div className="bg-white border-t border-slate-200 p-4 text-slate-700 text-xs select-none">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-slate-600">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-[#0870A2]" /> Maryam Gimbi Street, Asmara, Eritrea
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-800">
            <Phone className="w-3.5 h-3.5 text-[#0870A2]" /> Tel: +291 112831
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <Globe className="w-3.5 h-3.5 text-[#0870A2]" /> www.eritreavisit.com
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <Mail className="w-3.5 h-3.5 text-[#0870A2]" /> tours@eritreavisit.com
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              ✈ 🧳 🧭 🌍 🚢 🛂
            </span>
          </div>
          <span className="px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700 text-[11px]">
            Page {pageNumber} of 6
          </span>
        </div>
      </div>
    </div>
  );

  // --- Page 1 Component ---
  const renderPage1 = () => (
    <div className="p-6 space-y-6">
      {/* 1. EMPLOYEE PROFILE */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-amber-400" /> EMPLOYEE PROFILE
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 1.1</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main profile inputs (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID:</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 font-bold focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date (DD / MM / YYYY):</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white text-xs font-medium"
                />
              </div>
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Employment Status:</label>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-800">
                {(['Permanent', 'Contract', 'Temporary', 'Internship', 'Part-Time'] as const).map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="employmentStatus"
                      checked={employmentStatus === status}
                      onChange={() => setEmploymentStatus(status)}
                      className="w-4 h-4 text-[#134E6F] accent-[#134E6F] cursor-pointer"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Department:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-800">
                {[
                  'Administration',
                  'Sales & Reservations',
                  'Tour Operations',
                  'Tour Guide',
                  'Ticketing',
                  'Marketing',
                  'Finance',
                  'Customer Service',
                  'Transport',
                ].map((dept) => {
                  const isChecked = selectedDepartments.includes(dept);
                  return (
                    <label key={dept} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem(selectedDepartments, setSelectedDepartments, dept)}
                        className="w-4 h-4 rounded text-[#134E6F] accent-[#134E6F] cursor-pointer"
                      />
                      <span>{dept}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Other:</span>
                <input
                  type="text"
                  placeholder="Specify other department..."
                  value={deptOther}
                  onChange={(e) => setDeptOther(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title:</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Joining:</label>
                <input
                  type="date"
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reporting Manager:</label>
                <input
                  type="text"
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Employee Photo Box */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => photoInputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && photoInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handlePhotoFile(e.dataTransfer.files?.[0]);
            }}
            className="group flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#134E6F]/50 rounded-3xl bg-slate-50/70 text-center cursor-pointer transition"
          >
            {photoUrl ? (
              <div className="relative mb-2">
                <img
                  src={photoUrl}
                  alt="Employee Photo Preview"
                  className="w-28 h-32 rounded-2xl object-cover ring-2 ring-[#134E6F]/30 shadow-md"
                />
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <span className="text-[10px] font-bold text-white">{photoBusy ? 'Processing…' : 'Change'}</span>
                </div>
              </div>
            ) : (
              <div className="w-24 h-28 rounded-2xl bg-slate-200 flex flex-col items-center justify-center text-slate-400 mb-2">
                {photoBusy ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
              </div>
            )}
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">EMPLOYEE PHOTO</span>
            <span className="text-[10px] text-slate-500">
              {photoBusy ? 'Processing…' : 'Click or drop a photo to upload (Optional)'}
            </span>
            {photoError && <span className="text-[10px] text-rose-600 mt-1">{photoError}</span>}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                handlePhotoFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            {photoUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoUrl('');
                }}
                className="mt-2 text-[10px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. PERSONAL INFORMATION */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <UserPlus className="w-4 h-4 text-amber-400" /> PERSONAL INFORMATION
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 1.2</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-slate-500 font-normal">(As per Passport / National ID) *</span>:
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Bereket Habte Ghebre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#134E6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Name / Call Name:</label>
              <input
                type="text"
                placeholder="e.g., Bereket"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth:</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nationality:</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">National ID No.:</label>
                <input
                  type="text"
                  value={nationalIdNo}
                  onChange={(e) => setNationalIdNo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passport Number:</label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passport Expiry Date:</label>
                <input
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Driving License No. (if applicable):</label>
                <input
                  type="text"
                  value={drivingLicenseNo}
                  onChange={(e) => setDrivingLicenseNo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Gender:</label>
              <div className="flex items-center gap-6 text-xs font-medium text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === 'Male'}
                    onChange={() => setGender('Male')}
                    className="w-4 h-4 text-[#134E6F] accent-[#134E6F] cursor-pointer"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === 'Female'}
                    onChange={() => setGender('Female')}
                    className="w-4 h-4 text-[#134E6F] accent-[#134E6F] cursor-pointer"
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Marital Status:</label>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-800">
                {(['Single', 'Married', 'Divorced', 'Widowed'] as const).map((ms) => (
                  <label key={ms} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="maritalStatus"
                      checked={maritalStatus === ms}
                      onChange={() => setMaritalStatus(ms)}
                      className="w-4 h-4 text-[#134E6F] accent-[#134E6F] cursor-pointer"
                    />
                    <span>{ms}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Number of Dependents:</label>
                <input
                  type="number"
                  min="0"
                  value={dependentsCount}
                  onChange={(e) => setDependentsCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Place of Birth:</label>
                <input
                  type="text"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Country of Birth:</label>
              <input
                type="text"
                value={countryOfBirth}
                onChange={(e) => setCountryOfBirth(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Languages Spoken:</label>
              <input
                type="text"
                value={languagesSpoken}
                onChange={(e) => setLanguagesSpoken(e.target.value)}
                placeholder="e.g., Tigrinya, English, Italian, Arabic"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Page 2 Component ---
  const renderPage2 = () => (
    <div className="p-6 space-y-6">
      {/* CONTACT INFORMATION */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Phone className="w-4 h-4 text-amber-400" /> CONTACT INFORMATION
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 2.1</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address:</label>
              <input
                type="text"
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="Street address / House No. / Villa"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Region / Zoba:</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code:</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country:</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *:</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alternative Phone:</label>
              <input
                type="tel"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Personal Email *:</label>
              <input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="e.g. bereket.habte@gmail.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* EMERGENCY CONTACT */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 text-amber-400" /> EMERGENCY CONTACT
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 2.2</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name:</label>
            <input
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Relationship:</label>
            <input
              type="text"
              value={emergencyRelation}
              onChange={(e) => setEmergencyRelation(e.target.value)}
              placeholder="Spouse / Sibling / Parent"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Telephone Number:</label>
            <input
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address:</label>
            <input
              type="text"
              value={emergencyAddress}
              onChange={(e) => setEmergencyAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* FAMILY INFORMATION TABLE */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <UserPlus className="w-4 h-4 text-amber-400" /> FAMILY INFORMATION
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 2.3</span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0870A2] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-1/4">Relationship</th>
                  <th className="py-2.5 px-4 w-1/4">Name</th>
                  <th className="py-2.5 px-4 w-1/4">Occupation</th>
                  <th className="py-2.5 px-4 w-1/4">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {familyRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-4 font-bold text-slate-800">{row.relationship}</td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => {
                          const updated = [...familyRows];
                          updated[idx].name = e.target.value;
                          setFamilyRows(updated);
                        }}
                        placeholder="Full name..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.occupation}
                        onChange={(e) => {
                          const updated = [...familyRows];
                          updated[idx].occupation = e.target.value;
                          setFamilyRows(updated);
                        }}
                        placeholder="Occupation..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.contact}
                        onChange={(e) => {
                          const updated = [...familyRows];
                          updated[idx].contact = e.target.value;
                          setFamilyRows(updated);
                        }}
                        placeholder="Phone or email..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Page 3 Component ---
  const renderPage3 = () => (
    <div className="p-6 space-y-6">
      {/* EDUCATIONAL BACKGROUND */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-amber-400" /> EDUCATIONAL BACKGROUND
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 3.1</span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0870A2] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-1/4">Qualification</th>
                  <th className="py-2.5 px-4 w-1/3">Institution</th>
                  <th className="py-2.5 px-4 w-1/5">Country</th>
                  <th className="py-2.5 px-4">Year Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {educationRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{row.qualification}</td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.institution}
                        onChange={(e) => {
                          const updated = [...educationRows];
                          updated[idx].institution = e.target.value;
                          setEducationRows(updated);
                        }}
                        placeholder="School or University name..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.country}
                        onChange={(e) => {
                          const updated = [...educationRows];
                          updated[idx].country = e.target.value;
                          setEducationRows(updated);
                        }}
                        placeholder="Country..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.yearCompleted}
                        onChange={(e) => {
                          const updated = [...educationRows];
                          updated[idx].yearCompleted = e.target.value;
                          setEducationRows(updated);
                        }}
                        placeholder="YYYY"
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL QUALIFICATIONS */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" /> PROFESSIONAL QUALIFICATIONS
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 3.2</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Professional Certifications & Computer Skills */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Professional Certifications:</label>
              <div className="space-y-2">
                {certifications.map((cert, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={cert}
                    onChange={(e) => {
                      const updated = [...certifications];
                      updated[idx] = e.target.value;
                      setCertifications(updated);
                    }}
                    placeholder={`Certification ${idx + 1}...`}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium focus:bg-white"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Computer Skills:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-800">
                {[
                  'MS Office',
                  'Google Workspace',
                  'Reservation Systems',
                  'Amadeus',
                  'Galileo',
                  'Sabre',
                  'Canva',
                  'Adobe Software',
                  'Social Media Management',
                ].map((skill) => (
                  <label key={skill} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={computerSkills.includes(skill)}
                      onChange={() => toggleArrayItem(computerSkills, setComputerSkills, skill)}
                      className="w-4 h-4 rounded text-[#134E6F] accent-[#134E6F] cursor-pointer"
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Other:</span>
                <input
                  type="text"
                  placeholder="Other computer software..."
                  value={otherComputerSkill}
                  onChange={(e) => setOtherComputerSkill(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Languages Spoken */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Languages Spoken:</label>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-800">
                {['English', 'Tigrinya', 'Arabic', 'Italian', 'French', 'German', 'Spanish'].map((lang) => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profLanguages.includes(lang)}
                      onChange={() => toggleArrayItem(profLanguages, setProfLanguages, lang)}
                      className="w-4 h-4 rounded text-[#134E6F] accent-[#134E6F] cursor-pointer"
                    />
                    <span className="font-medium">{lang}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Other:</span>
                <input
                  type="text"
                  placeholder="e.g., Tigre, Bilen, Saho, Russian..."
                  value={otherProfLanguage}
                  onChange={(e) => setOtherProfLanguage(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EMPLOYMENT HISTORY */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-amber-400" /> EMPLOYMENT HISTORY
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 3.3</span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0870A2] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-1/4">Employer</th>
                  <th className="py-2.5 px-4 w-1/4">Position</th>
                  <th className="py-2.5 px-4 w-1/5">Duration (From - To)</th>
                  <th className="py-2.5 px-4">Reason for Leaving</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {employmentHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.employer}
                        onChange={(e) => {
                          const updated = [...employmentHistory];
                          updated[idx].employer = e.target.value;
                          setEmploymentHistory(updated);
                        }}
                        placeholder="Company name..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.position}
                        onChange={(e) => {
                          const updated = [...employmentHistory];
                          updated[idx].position = e.target.value;
                          setEmploymentHistory(updated);
                        }}
                        placeholder="Role / Title..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={row.durationFrom}
                          onChange={(e) => {
                            const updated = [...employmentHistory];
                            updated[idx].durationFrom = e.target.value;
                            setEmploymentHistory(updated);
                          }}
                          placeholder="From"
                          className="w-1/2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
                        />
                        <span>-</span>
                        <input
                          type="text"
                          value={row.durationTo}
                          onChange={(e) => {
                            const updated = [...employmentHistory];
                            updated[idx].durationTo = e.target.value;
                            setEmploymentHistory(updated);
                          }}
                          placeholder="To"
                          className="w-1/2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.reasonForLeaving}
                        onChange={(e) => {
                          const updated = [...employmentHistory];
                          updated[idx].reasonForLeaving = e.target.value;
                          setEmploymentHistory(updated);
                        }}
                        placeholder="Reason..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Page 4 Component ---
  const renderPage4 = () => (
    <div className="p-6 space-y-6">
      {/* TRAVEL & TOURISM EXPERIENCE */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Globe className="w-4 h-4 text-amber-400" /> TRAVEL & TOURISM EXPERIENCE
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 4.1</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Years of Experience:</label>
            <div className="space-y-2 text-xs font-medium text-slate-800">
              {['Less than 1 Year', '1 – 3 Years', '3 – 5 Years', '5 – 10 Years', 'Over 10 Years'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="yearsExperience"
                    checked={yearsExperience === opt}
                    onChange={() => setYearsExperience(opt)}
                    className="w-4 h-4 text-[#134E6F] accent-[#134E6F] cursor-pointer"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Areas of Experience: <span className="font-normal text-slate-500">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-800">
              {[
                'Tour Guiding',
                'Tour Planning',
                'Airline Ticketing',
                'Visa Processing',
                'Hotel Reservations',
                'Customer Service',
                'Marketing',
                'Transport Coordination',
                'Travel Insurance',
                'Event Management',
              ].map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tourismAreas.includes(area)}
                    onChange={() => toggleArrayItem(tourismAreas, setTourismAreas, area)}
                    className="w-4 h-4 rounded text-[#134E6F] accent-[#134E6F] cursor-pointer"
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Other:</span>
              <input
                type="text"
                placeholder="Specify other experience..."
                value={otherTourismArea}
                onChange={(e) => setOtherTourismArea(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BANK INFORMATION & TAX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BANK INFORMATION */}
        <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
          <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-amber-400" /> BANK INFORMATION
            </div>
            <span className="text-[10px] font-mono text-emerald-100">Section 4.2</span>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name:</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Branch:</label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Name:</label>
              <input
                type="text"
                value={accountName || fullName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Number:</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IBAN (if available):</label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* TAX & SOCIAL SECURITY */}
        <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> TAX & SOCIAL SECURITY
            </div>
            <span className="text-[10px] font-mono text-emerald-100">Section 4.3</span>
          </div>
          <div className="p-5 space-y-4 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tax Identification Number (TIN):</label>
              <input
                type="text"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Social Security / Pension Number:</label>
              <input
                type="text"
                value={socialSecurityNo}
                onChange={(e) => setSocialSecurityNo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900"
              />
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
              <p className="font-semibold">Statutory Compliance Notice:</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                All tax and social security contributions will be filed directly with the State of Eritrea Revenue Authority in accordance with national labor guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MEDICAL INFORMATION */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 text-amber-400" /> MEDICAL INFORMATION
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 4.4</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group:</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies:</label>
            <input
              type="text"
              value={knownAllergies}
              onChange={(e) => setKnownAllergies(e.target.value)}
              placeholder="e.g., Penicillin, Peanuts, None"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Medical Conditions (Optional):</label>
            <input
              type="text"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              placeholder="Any ongoing conditions..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Special Assistance Required:</label>
            <input
              type="text"
              value={specialAssistance}
              onChange={(e) => setSpecialAssistance(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* EQUIPMENT ISSUED (To be completed by HR) */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-amber-400" /> EQUIPMENT ISSUED (To be completed by HR)
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 4.5</span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0870A2] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-1/4">Item</th>
                  <th className="py-2.5 px-4 w-1/3">Serial No.</th>
                  <th className="py-2.5 px-4 w-1/5">Date Issued</th>
                  <th className="py-2.5 px-4 text-center">Returned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {equipmentRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{row.item}</td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={row.serialNo}
                        onChange={(e) => {
                          const updated = [...equipmentRows];
                          updated[idx].serialNo = e.target.value;
                          setEquipmentRows(updated);
                        }}
                        placeholder="Serial Number / Model..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="date"
                        value={row.dateIssued}
                        onChange={(e) => {
                          const updated = [...equipmentRows];
                          updated[idx].dateIssued = e.target.value;
                          setEquipmentRows(updated);
                        }}
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={row.returned}
                        onChange={(e) => {
                          const updated = [...equipmentRows];
                          updated[idx].returned = e.target.checked;
                          setEquipmentRows(updated);
                        }}
                        className="w-4 h-4 rounded text-[#134E6F] accent-[#134E6F] cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Page 5 Component ---
  const renderPage5 = () => (
    <div className="p-6 space-y-6">
      {/* UNIFORM DETAILS */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Shirt className="w-4 h-4 text-amber-400" /> UNIFORM DETAILS (If Applicable)
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 5.1</span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Shirt Size:</label>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-800">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((sz) => (
                <label key={sz} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shirtSize"
                    checked={shirtSize === sz}
                    onChange={() => setShirtSize(sz)}
                    className="w-4 h-4 text-[#134E6F] accent-[#134E6F] cursor-pointer"
                  />
                  <span>{sz}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Jacket Size:</label>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-800">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((sz) => (
                <label key={sz} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="jacketSize"
                    checked={jacketSize === sz}
                    onChange={() => setJacketSize(sz)}
                    className="w-4 h-4 text-[#134E6F] accent-[#134E6F] cursor-pointer"
                  />
                  <span>{sz}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trouser Size:</label>
              <input
                type="text"
                value={trouserSize}
                onChange={(e) => setTrouserSize(e.target.value)}
                placeholder="e.g., 32 / 34"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shoe Size:</label>
              <input
                type="text"
                value={shoeSize}
                onChange={(e) => setShoeSize(e.target.value)}
                placeholder="e.g., 42 (EU)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* OTHER INFORMATION */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" /> OTHER INFORMATION
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 5.2</span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hobbies / Interests:</label>
            <input
              type="text"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Memberships (if any):</label>
            <input
              type="text"
              value={memberships}
              onChange={(e) => setMemberships(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Awards / Achievements (if any):</label>
            <input
              type="text"
              value={awards}
              onChange={(e) => setAwards(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">How did you hear about EritreaVisit?</label>
            <input
              type="text"
              value={hearAboutUs}
              onChange={(e) => setHearAboutUs(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* DECLARATION */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4 text-amber-400" /> DECLARATION
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 5.3</span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
            "I hereby declare that all the information provided in this form is true, complete and correct to the best of my knowledge and belief. I understand that any false or misleading information may result in disciplinary action or termination of employment. I authorize EritreaVisit, operated by EritreaVisit Tours & Travel, to verify any information provided in this form."
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee Signature:</label>
              <div className="relative">
                <input
                  type="text"
                  value={employeeSignature || fullName}
                  onChange={(e) => setEmployeeSignature(e.target.value)}
                  placeholder="Type legal signature..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-serif italic text-base font-bold text-slate-900 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono text-emerald-600 font-bold">SIGNED</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date:</label>
              <input
                type="date"
                value={declarationDate}
                onChange={(e) => setDeclarationDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOR HR USE ONLY (Page 5 Part) */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-slate-50/80 shadow-2xs">
        <div className="bg-slate-700 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> FOR HR USE ONLY
          </div>
          <span className="text-[10px] font-mono text-slate-300">Administrative Intake</span>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Date Received:</label>
            <input
              type="date"
              value={hrDateReceived}
              onChange={(e) => setHrDateReceived(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Employee ID Assigned:</label>
            <input
              type="text"
              value={employeeId}
              readOnly
              className="w-full px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 font-mono text-xs text-slate-900 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">HR Officer:</label>
            <input
              type="text"
              value={hrOfficer}
              onChange={(e) => setHrOfficer(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Assigned:</label>
            <input
              type="text"
              value={hrAssignedDept}
              onChange={(e) => setHrAssignedDept(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
            />
          </div>
        </div>

        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs border-t border-slate-200 pt-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Staff Role (system access):</label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as StaffRole)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
            >
              {(['Tour Guide', 'Operations Manager', 'Agent', 'HR', 'Logistics Lead', 'Admin'] as StaffRole[]).map(
                (r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Salary Tier:</label>
            <select
              value={salaryTier}
              onChange={(e) => setSalaryTier(e.target.value as SalaryTier)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
            >
              {(['Tier 1 - Senior Lead', 'Tier 2 - Specialist', 'Tier 3 - Associate', 'Contractor'] as SalaryTier[]).map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Monthly Salary (USD):</label>
            <input
              type="number"
              min={0}
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // --- Page 6 Component ---
  const renderPage6 = () => (
    <div className="p-6 space-y-6">
      {/* FOR HR USE ONLY (CONTINUED) */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> FOR HR USE ONLY (CONTINUED)
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 6.1</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DOCUMENTS RECEIVED */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              DOCUMENTS RECEIVED <span className="font-normal text-slate-500">(Please tick)</span>:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-800">
              {[
                'National ID',
                'Passport',
                'CV',
                'Academic Certificates',
                'Professional Certificates',
                'Reference Letters',
                'Police Clearance',
                'Medical Certificate',
                'Bank Details',
                'Passport Photos',
              ].map((doc) => (
                <label key={doc} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={docsReceived.includes(doc)}
                    onChange={() => toggleArrayItem(docsReceived, setDocsReceived, doc)}
                    className="w-4 h-4 rounded text-[#134E6F] accent-[#134E6F] cursor-pointer"
                  />
                  <span>{doc}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Other:</span>
              <input
                type="text"
                placeholder="Other attached certificate..."
                value={otherDoc}
                onChange={(e) => setOtherDoc(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* VERIFICATION & CHECKS */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">VERIFICATION & CHECKS:</h4>
            <div className="space-y-2.5 text-xs text-slate-800">
              {[
                { label: 'Educational Certificates Verified:', state: educationVerified, setter: setEducationVerified },
                { label: 'Reference Check Completed:', state: referenceCheckCompleted, setter: setReferenceCheckCompleted },
                { label: 'Criminal Record Cleared:', state: criminalRecordCleared, setter: setCriminalRecordCleared },
                { label: 'Medical Examination Done:', state: medicalExamDone, setter: setMedicalExamDone },
                { label: 'Documents Verified:', state: documentsVerified, setter: setDocumentsVerified },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={item.state === true}
                        onChange={() => item.setter(true)}
                        className="w-3.5 h-3.5 text-[#134E6F] accent-[#134E6F]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={item.state === false}
                        onChange={() => item.setter(false)}
                        className="w-3.5 h-3.5 text-rose-600 accent-rose-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">REMARKS:</label>
              <textarea
                rows={2}
                value={hrRemarks}
                onChange={(e) => setHrRemarks(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* APPROVAL */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" /> APPROVAL
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 6.2</span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Application Reviewed By:</label>
            <input
              type="text"
              value={reviewedBy}
              onChange={(e) => setReviewedBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">HR Manager / Director:</label>
            <input
              type="text"
              value={hrManager}
              onChange={(e) => setHrManager(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Signature:</label>
            <input
              type="text"
              value={approvalSignature}
              onChange={(e) => setApprovalSignature(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-serif italic text-xs font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Date:</label>
            <input
              type="date"
              value={approvalDate}
              onChange={(e) => setApprovalDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* ORIENTATION & ONBOARDING */}
      <div className="border border-slate-300 rounded-3xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#134E6F] text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> ORIENTATION & ONBOARDING
          </div>
          <span className="text-[10px] font-mono text-emerald-100">Section 6.3</span>
        </div>

        <div className="p-5 sm:p-6 space-y-3 text-xs">
          {[
            { label: 'Orientation Completed:', state: orientationDone, setter: setOrientationDone, dateState: orientationDate, dateSetter: setOrientationDate },
            { label: 'Employee Added to Payroll:', state: payrollDone, setter: setPayrollDone, dateState: payrollDate, dateSetter: setPayrollDate },
            { label: 'Employee Email Created:', state: emailDone, setter: setEmailDone, dateState: emailDate, dateSetter: setEmailDate },
            { label: 'Employee ID Issued:', state: idDone, setter: setIdDone, dateState: idDate, dateSetter: setIdDate },
          ].map((row, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 sm:w-1/3">{row.label}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={row.state === true}
                    onChange={() => row.setter(true)}
                    className="w-3.5 h-3.5 text-[#134E6F] accent-[#134E6F]"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={row.state === false}
                    onChange={() => row.setter(false)}
                    className="w-3.5 h-3.5 text-rose-600 accent-rose-600"
                  />
                  <span>No</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Date:</span>
                <input
                  type="date"
                  value={row.dateState}
                  onChange={(e) => row.dateSetter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[94vh] text-slate-800">
        {/* Top Control Bar with Quick Fill, Page Navigation & Print */}
        <div className="px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-mono">
                  ERITREAVISIT HR RECRUITMENT
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  Official Form
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Human Resources Department • EritreaVisit Tours & Travel (Maryam Gimbi St, Asmara)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFillSample}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Pre-fill sample data for Bereket Habte (Senior Naturalist)"
            >
              <Sparkles className="w-3.5 h-3.5" /> Fill Sample
            </button>
            <button
              type="button"
              onClick={() => setActivePage(activePage === 'all' ? 1 : 'all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                activePage === 'all'
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
            >
              {activePage === 'all' ? 'Step-by-Step View' : 'Full 6-Page View'}
            </button>
            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Download standalone HTML document for offline printing or PDF saving"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" /> Download
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Print official document"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Switcher Tabs (when not in 'all' mode) */}
        {activePage !== 'all' && (
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              {[
                { num: 1, label: '1. Profile & Personal' },
                { num: 2, label: '2. Contact & Family' },
                { num: 3, label: '3. Education & Skills' },
                { num: 4, label: '4. Experience & Bank' },
                { num: 5, label: '5. Uniform & Declaration' },
                { num: 6, label: '6. HR Verification' },
              ].map((tab) => (
                <button
                  key={tab.num}
                  type="button"
                  onClick={() => setActivePage(tab.num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activePage === tab.num
                      ? 'bg-[#134E6F] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono font-bold text-slate-600 shrink-0">
              Page {activePage} of 6
            </div>
          </div>
        )}

        {/* Form Body / Scrollable Area */}
        <div id="printable-eritreavisit-form" className="flex-1 overflow-y-auto bg-slate-50/50">
          {activePage === 'all' ? (
            /* Complete 6-Page Unified Document */
            <div className="space-y-8 p-4 sm:p-6">
              <div className="bg-white rounded-3xl shadow-md border border-slate-300 overflow-hidden">
                {renderOfficialHeader(1)}
                {renderPage1()}
                {renderOfficialFooter(1)}
              </div>

              <div className="bg-white rounded-3xl shadow-md border border-slate-300 overflow-hidden">
                {renderOfficialHeader(2)}
                {renderPage2()}
                {renderOfficialFooter(2)}
              </div>

              <div className="bg-white rounded-3xl shadow-md border border-slate-300 overflow-hidden">
                {renderOfficialHeader(3)}
                {renderPage3()}
                {renderOfficialFooter(3)}
              </div>

              <div className="bg-white rounded-3xl shadow-md border border-slate-300 overflow-hidden">
                {renderOfficialHeader(4)}
                {renderPage4()}
                {renderOfficialFooter(4)}
              </div>

              <div className="bg-white rounded-3xl shadow-md border border-slate-300 overflow-hidden">
                {renderOfficialHeader(5)}
                {renderPage5()}
                {renderOfficialFooter(5)}
              </div>

              <div className="bg-white rounded-3xl shadow-md border border-slate-300 overflow-hidden">
                {renderOfficialHeader(6)}
                {renderPage6()}
                {renderOfficialFooter(6)}
              </div>
            </div>
          ) : (
            /* Single Page Step View */
            <div className="bg-white m-4 sm:m-6 rounded-3xl shadow-xs border border-slate-300 overflow-hidden">
              {renderOfficialHeader(activePage as number)}
              {activePage === 1 && renderPage1()}
              {activePage === 2 && renderPage2()}
              {activePage === 3 && renderPage3()}
              {activePage === 4 && renderPage4()}
              {activePage === 5 && renderPage5()}
              {activePage === 6 && renderPage6()}
              {renderOfficialFooter(activePage as number)}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activePage !== 'all' && typeof activePage === 'number' && activePage > 1 && (
              <button
                type="button"
                onClick={() => setActivePage((prev) => (typeof prev === 'number' ? prev - 1 : 1))}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Page
              </button>
            )}

            {activePage !== 'all' && typeof activePage === 'number' && activePage < 6 && (
              <button
                type="button"
                onClick={() => setActivePage((prev) => (typeof prev === 'number' ? prev + 1 : 6))}
                className="px-5 py-2 rounded-full bg-[#0870A2] hover:bg-[#0870A2] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                Next Page <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-6 py-2.5 rounded-full bg-[#DC4116] hover:bg-brand-600 text-white text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save & Activate Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
