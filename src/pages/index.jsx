import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const inputClass = (hasErr) =>
  `w-full border rounded-lg px-3 py-2 mt-1 outline-none transition ${
    hasErr ? "border-red-500" : "border-gray-300 focus:border-black"
  }`;

const App = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    image: null,
  });

  const setVal = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const validators = useMemo(
    () => ({
      1: [
        () => (!form.firstName ? { firstName: "Нэр оруулна уу" } : null),
        () => (!form.lastName ? { lastName: "Овог оруулна уу" } : null),
        () => (!form.username ? { username: "Username оруулна уу" } : null),
      ],
      2: [
        () => (!form.email ? { email: "Email оруулна уу" } : null),
        () => (!form.phone ? { phone: "Утасны дугаар оруулна уу" } : null),
        () => (!form.password ? { password: "Нууц үг оруулна уу" } : null),
        () =>
          form.password !== form.confirmPassword
            ? { confirmPassword: "Нууц үг таарахгүй байна" }
            : null,
      ],
      3: [
        () => (!form.dob ? { dob: "Төрсөн өдөр оруулна уу" } : null),
        () => (!form.image ? { image: "Профайл зураг оруулна уу" } : null),
      ],
    }),
    [form]
  );

  const validateStep = () => {
    const nextErrors = (validators[step] || []).reduce((acc, rule) => {
      const out = rule();
      return out ? { ...acc, ...out } : acc;
    }, {});
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => validateStep() && setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const submit = () => validateStep() && alert("You're All Set 🔥");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow">
        <div className="w-10 h-10 ">
          <img src="main.png" alt="" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Join Us 😎</h1>
        <p className="text-gray-500 mb-4">
          Please provide all current information accurately.
        </p>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-3"
            >
              <Input
                label="First name"
                value={form.firstName}
                onChange={(v) => setVal("firstName", v)}
                error={errors.firstName}
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(v) => setVal("lastName", v)}
                error={errors.lastName}
              />
              <Input
                label="Username"
                value={form.username}
                onChange={(v) => setVal("username", v)}
                error={errors.username}
              />
              <Button onClick={next}>Continue 1/3</Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-3"
            >
              <Input
                label="Email"
                value={form.email}
                onChange={(v) => setVal("email", v)}
                error={errors.email}
              />
              <Input
                label="Phone number"
                value={form.phone}
                onChange={(v) => setVal("phone", v)}
                error={errors.phone}
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => setVal("password", v)}
                error={errors.password}
              />
              <Input
                label="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(v) => setVal("confirmPassword", v)}
                error={errors.confirmPassword}
              />

              <div className="flex gap-2">
                <SecondaryButton onClick={back}>Back</SecondaryButton>
                <Button onClick={next}>Continue 2/3</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-3"
            >
              <Input
                label="Date of birth"
                type="date"
                value={form.dob}
                onChange={(v) => setVal("dob", v)}
                error={errors.dob}
              />

              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  id="img"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setVal("image", e.target.files?.[0] || null)}
                />
                <label htmlFor="img" className="cursor-pointer text-gray-500">
                  Browse or Drop Image
                </label>
              </div>
              {errors.image && (
                <p className="text-red-500 text-sm">{errors.image}</p>
              )}

              <div className="flex gap-2">
                <SecondaryButton onClick={back}>Back</SecondaryButton>
                <Button onClick={submit}>Submit</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, error, type = "text" }) => (
  <div>
    <label className="text-sm font-medium">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass(!!error)}
      placeholder={`Your ${label.toLowerCase()}`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const Button = ({ children, ...props }) => (
  <button
    {...props}
    type="button"
    className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90"
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, ...props }) => (
  <button
    {...props}
    type="button"
    className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
  >
    {children}
  </button>
);

export default App;
