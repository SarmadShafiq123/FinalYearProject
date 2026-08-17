import { useState } from "react";
import { Mail, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import LandingLayout from "../../components/landing/LandingLayout";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, formData);
      toast.success("Message sent! We'll reply within 24 hours.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LandingLayout>
      <div className="pt-32 pb-8 px-6 text-center">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
          CONTACT
        </div>
        <h1 className="text-3xl font-bold text-white">Get in touch</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Have questions? We'd love to hear from you.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-white mb-6">
            Contact Information
          </h2>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <Mail className="text-blue-400" size={16} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Email</p>
              <p className="text-sm text-zinc-300">cloudstore.fyp@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <MapPin className="text-blue-400" size={16} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Location</p>
              <p className="text-sm text-zinc-300">
                University of Central Punjab, Lahore, Pakistan
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <Clock className="text-blue-400" size={16} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Response Time</p>
              <p className="text-sm text-zinc-300">Within 24 hours</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5 block">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                rows={4}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium py-2.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Contact;
