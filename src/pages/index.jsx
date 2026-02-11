import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LS_KEY = "join-us-form-v1";

const initial = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  dob: "",
  profileImageUrl: "",
};

const pad2 = (n) => String(n).padStart(2, "0");
const daysInMonth = (y, m) => new Date(y, m, 0).getDate(); // m = 1..12
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
const onlyDigits = (v) => String(v ?? "").replace(/\D/g, "");

const yearsDiff = (dateStr) => {
  if (!dateStr) return 0;
  const today = new Date();
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 0;
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

const formatNiceDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const loadForm = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveForm = (payload) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {}
};

const clearForm = () => {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const pageVariants = {
  initial: (dir) => ({
    opacity: 0,
    y: 18,
    x: dir > 0 ? 18 : -18,
    filter: "blur(2px)",
  }),
  animate: { opacity: 1, y: 0, x: 0, filter: "blur(0px)" },
  exit: (dir) => ({
    opacity: 0,
    y: -12,
    x: dir > 0 ? -18 : 18,
    filter: "blur(2px)",
  }),
};

const fieldVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const errorShake = {
  x: [0, -6, 6, -4, 4, 0],
  transition: { duration: 0.25 },
};

const Field = ({
  label,
  required,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
}) => {
  const base =
    "w-full rounded-[14px] border bg-white px-4 py-4 text-lg outline-none transition";
  const ok = "border-slate-300 focus:border-slate-400";
  const bad = "border-red-500 focus:border-red-500";

  return (
    <motion.div variants={fieldVariants} className="space-y-2">
      <div className="text-lg font-semibold text-slate-800">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>

      <motion.input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${base} ${error ? bad : ok}`}
        animate={error ? errorShake : { x: 0 }}
      />

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-red-500 text-base"
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

const Button = ({
  children,
  variant = "primary",
  onClick,
  disabled,
  className = "",
}) => {
  const common =
    "h-14 rounded-[14px] px-6 text-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const primary = "bg-slate-800 text-white hover:bg-slate-900";
  const ghost =
    "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={disabled ? {} : { y: -1 }}
      onClick={onClick}
      disabled={disabled}
      className={`${common} ${variant === "primary" ? primary : ghost} ${className}`}
      type="button"
    >
      {children}
    </motion.button>
  );
};

export default function App() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [data, setData] = useState(initial);
  const [dobParts, setDobParts] = useState({ y: "", m: "", d: "" });
  const [touched, setTouched] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef(null);
  const prevStepRef = useRef(1);
  const direction = step >= prevStepRef.current ? 1 : -1;

  useEffect(() => {
    const saved = loadForm();
    if (saved && typeof saved === "object") {
      setStep(saved.step ?? 1);
      setDone(Boolean(saved.done));
      setData({ ...initial, ...(saved.data ?? {}) });
      const iso = saved?.data?.dob;
      if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const [y, m, d] = iso.split("-");
        setDobParts({ y, m, d });
      }
      setTouched(saved.touched ?? {});
      prevStepRef.current = saved.step ?? 1;
    }
  }, []);

  useEffect(() => {
    saveForm({ step, done, data, touched });
  }, [step, done, data, touched]);

  useEffect(() => {
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  const errors = useMemo(() => {
    const e = {};

    if (step === 1) {
      if (!data.firstName.trim()) e.firstName = "Нэрээ оруулна уу";
      if (!data.lastName.trim()) e.lastName = "Овгоо оруулна уу.";
      if (!data.username.trim()) e.username = "Хэрэглэгчийн нэрээ оруулна уу";
    }

    if (step === 2) {
      if (!data.email.trim() || !isEmail(data.email))
        e.email = "Зөв мэйл хаяг оруулна уу";

      const phoneDigits = onlyDigits(data.phone);
      if (phoneDigits.length !== 8) e.phone = "8 оронтой дугаар оруулна уу.";

      const passDigits = onlyDigits(data.password);
      if (!data.password || passDigits.length < 6)
        e.password = "6 оронтой тоо оруулна уу";

      if (!data.confirmPassword)
        e.confirmPassword = "Нууц үгээ давтан оруулна уу";
      if (data.confirmPassword && data.password !== data.confirmPassword)
        e.confirmPassword = "Нууц үг таарахгүй байна";
    }

    if (step === 3) {
      const age = yearsDiff(data.dob);
      if (!data.dob) e.dob = "Төрсөн өбрөө оруулна уу";
      else if (age < 18) e.dob = "Та 18 ба түүнээс дээш настай байх ёстой.";

      if (!data.profileImageUrl) e.profileImage = "Профайл зургаа оруулна уу";
    }

    return e;
  }, [data, step]);

  const canContinue = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const markTouched = (name) => setTouched((p) => ({ ...p, [name]: true }));
  const setField = (name, value) => setData((p) => ({ ...p, [name]: value }));
  const showError = (name) => Boolean(touched[name] && errors[name]);

  const continueNext = () => {
    if (step === 1) ["firstName", "lastName", "username"].forEach(markTouched);
    if (step === 2)
      ["email", "phone", "password", "confirmPassword"].forEach(markTouched);
    if (step === 3) ["dob", "profileImage"].forEach(markTouched);

    if (!canContinue) return;

    prevStepRef.current = step;
    if (step < 3) setStep((s) => s + 1);
    else setDone(true);
  };

  const goBack = () => {
    prevStepRef.current = step;
    setStep((s) => Math.max(1, s - 1));
  };

  const handleFiles = async (files) => {
    const file = files && files[0];
    if (!file || !file.type?.startsWith("image/")) return;
    const url = await fileToDataUrl(file);
    setField("profileImageUrl", url);
    markTouched("profileImage");
  };

  const handleChangeFile = async (e) => {
    const files = e.target.files;
    await handleFiles(files);
    e.target.value = "";
  };

  const clearImage = () => {
    setField("profileImageUrl", "");
    markTouched("profileImage");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    await handleFiles(files);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 ">
        <div className="bg-white h-90 w-140 p-6 rounded-xl shadow">
          <div className="">
            <img src="main.png" className="h-25"></img>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-5xl font-extrabold text-slate-900 tracking-tight"
            >
              You're All Set!{" "}
              <motion.span
                animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-block"
              >
                🔥
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-4 text-2xl text-slate-400"
            >
              We've received your submission. Thank you!
            </motion.p>
            <div className="mt-10">
              <Button
                variant="ghost"
                onClick={() => {
                  setDone(false);
                  setStep(1);
                  prevStepRef.current = 1;
                  setData(initial);
                  setTouched({});
                  clearForm();
                }}
              >
                Sumbit Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow">
        <div className="mt-4">
          <img src="main.png" className="h-25"></img>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Join Us! 😎
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 text-2xl text-slate-400"
          >
            Please provide all current information accurately.
          </motion.p>
        </div>
        <div className="mt-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-8"
            >
              {step === 1 ? (
                <>
                  <Field
                    label="First name"
                    required
                    placeholder="Your first name"
                    value={data.firstName}
                    onChange={(e) => {
                      setField("firstName", e.target.value);
                      markTouched("firstName");
                    }}
                    error={showError("firstName") ? errors.firstName : ""}
                    autoComplete="given-name"
                  />
                  <Field
                    label="Last name"
                    required
                    placeholder="Your last name"
                    value={data.lastName}
                    onChange={(e) => {
                      setField("lastName", e.target.value);
                      markTouched("lastName");
                    }}
                    error={showError("lastName") ? errors.lastName : ""}
                    autoComplete="family-name"
                  />
                  <Field
                    label="Username"
                    required
                    placeholder="Your username"
                    value={data.username}
                    onChange={(e) => {
                      setField("username", e.target.value);
                      markTouched("username");
                    }}
                    error={showError("username") ? errors.username : ""}
                    autoComplete="username"
                  />
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <Field
                    label="Email"
                    required
                    placeholder="Your email"
                    value={data.email}
                    onChange={(e) => {
                      setField("email", e.target.value);
                      markTouched("email");
                    }}
                    error={showError("email") ? errors.email : ""}
                    type="email"
                    autoComplete="email"
                  />
                  <Field
                    label="Phone number"
                    required
                    placeholder="Your phone number"
                    value={data.phone}
                    onChange={(e) => {
                      setField("phone", e.target.value);
                      markTouched("phone");
                    }}
                    error={showError("phone") ? errors.phone : ""}
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                  <Field
                    label="Password"
                    required
                    placeholder="Your password"
                    value={data.password}
                    onChange={(e) => {
                      setField("password", e.target.value);
                      markTouched("password");
                    }}
                    error={showError("password") ? errors.password : ""}
                    type="password"
                    autoComplete="new-password"
                  />
                  <Field
                    label="Confirm password"
                    required
                    placeholder="Confirm password"
                    value={data.confirmPassword}
                    onChange={(e) => {
                      setField("confirmPassword", e.target.value);
                      markTouched("confirmPassword");
                    }}
                    error={
                      showError("confirmPassword") ? errors.confirmPassword : ""
                    }
                    type="password"
                    autoComplete="new-password"
                  />
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-slate-800">
                      Date of birth <span className="text-red-500">*</span>
                    </div>

                    <input
                      type="date"
                      value={data.dob}
                      onChange={(e) => {
                        setField("dob", e.target.value);
                        markTouched("dob");
                      }}
                      className={`w-full rounded-[14px] border px-4 py-4 text-lg text-center bg-slate-200 outline-none ${
                        showError("dob")
                          ? "border-red-500"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                      style={{
                        fontSize: 16,
                        WebkitAppearance: "none",
                        appearance: "none",
                      }}
                    />

                    {showError("dob") ? (
                      <div className="text-red-500 text-base">{errors.dob}</div>
                    ) : null}
                  </div>

                  <motion.div variants={fieldVariants} className="space-y-2">
                    <div className="text-lg font-semibold text-slate-800">
                      Profile image <span className="text-red-500">*</span>
                    </div>

                    <motion.div
                      animate={
                        showError("profileImage") ? errorShake : { x: 0 }
                      }
                      onClick={() => inputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative w-full rounded-[14px] border bg-white p-4 cursor-pointer select-none ${
                        showError("profileImage")
                          ? "border-red-500"
                          : "border-slate-200"
                      }`}
                    >
                      <div
                        className={`relative rounded-[14px] border text-center overflow-hidden ${
                          isDragging
                            ? "border-2 border-dashed border-slate-900 bg-slate-50"
                            : "border-slate-200 bg-slate-100"
                        }`}
                        style={{ height: 190 }}
                      >
                        {!data.profileImageUrl ? (
                          <div className="flex h-full flex-col items-center justify-center gap-3">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200">
                              🖼️
                            </div>
                            <div className="text-xl text-slate-900">
                              Browse or Drop Image
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={data.profileImageUrl}
                              alt="profile"
                              className="absolute inset-0 w-full h-full object-cover object-center"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearImage();
                              }}
                              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-700/90 text-white flex items-center justify-center"
                              aria-label="remove"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>

                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChangeFile}
                        className="hidden"
                      />
                    </motion.div>

                    <AnimatePresence>
                      {showError("profileImage") ? (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="text-red-500 text-base"
                        >
                          {errors.profileImage}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-5">
          {step === 1 ? (
            <Button onClick={continueNext} className="w-full mt-7">
              Continue 1/3 <span className="ml-2">›</span>
            </Button>
          ) : (
            <div className="flex gap-4 items-center">
              <Button variant="ghost" onClick={goBack} className="mt-7">
                <span className="mr-2">‹</span> Back
              </Button>

              <Button onClick={continueNext} className="mt-7 w-67">
                Continue {step}/3 <span className="ml-2">›</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
