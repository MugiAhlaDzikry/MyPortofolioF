import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Mail, MapPin, Check, Copy, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import ScrollReveal from '../components/Animations/ScrollReveal';
import MagneticButton from '../components/Animations/MagneticButton';
import styles from './Contact.module.css';
import { supabase } from '../lib/supabaseClient';

// EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_zd9z3ut';
const EMAILJS_TEMPLATE_ID = 'template_vhdb87p';
const EMAILJS_PUBLIC_KEY = 'hGBpyNAmnZrZNQPPd';

export default function Contact() {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [copied, setCopied] = useState(false);
  const [contactEmail, setContactEmail] = useState('hello@example.com');
  const [sendStatus, setSendStatus] = useState('idle'); // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchHeroData = async () => {
      const { data } = await supabase.from('hero').select('email').eq('id', 1).single();
      if (data?.email) {
        // Clean mailto: if present
        const cleanEmail = data.email.replace('mailto:', '');
        setContactEmail(cleanEmail);
      }
    };
    fetchHeroData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSendStatus('sending');
    setErrorMessage('');

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        EMAILJS_PUBLIC_KEY
      );

      setSendStatus('success');
      setFormData({ name: '', email: '', message: '' });

      // Reset to idle after 5 seconds
      setTimeout(() => setSendStatus('idle'), 5000);
    } catch (err) {
      console.error('EmailJS Error:', err);
      setSendStatus('error');
      setErrorMessage(
        err?.text || 'Gagal mengirim pesan. Silakan coba lagi atau hubungi melalui email langsung.'
      );

      // Reset error after 6 seconds
      setTimeout(() => {
        setSendStatus('idle');
        setErrorMessage('');
      }, 6000);
    }
  };

  return (
    <section className={`section ${styles.contact}`} id="contact">
      <div className="container">
        {/* Header */}
        <div className={styles.contactHeader}>
          <ScrollReveal>
            <div className="section-label">Get In Touch</div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h2 className={styles.contactHeading}>
              Let's start a project together.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className={styles.contactSubtext}>
              Punya ide proyek atau peluang kolaborasi? Kirimkan pesan Anda melalui formulir di bawah ini atau hubungi saya langsung melalui kontak yang tersedia.
            </p>
          </ScrollReveal>
        </div>

        {/* Contact Grid */}
        <div className={styles.contactGrid}>
          {/* Left: Contact Form Card */}
          <ScrollReveal delay={0.15}>
            <div className={styles.formCard}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    <span className={styles.labelNumber}>01</span>
                    What's your name?
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    <span className={styles.labelNumber}>02</span>
                    What's your email?
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    <span className={styles.labelNumber}>03</span>
                    Your message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    placeholder="Ceritakan tentang ide, kebutuhan proyek, atau hal yang ingin Anda diskusikan..."
                    rows={4}
                    required
                  ></textarea>
                </div>

                <div className={styles.formFooter}>
                  <MagneticButton
                    tag="button"
                    type="submit"
                    className={`${styles.submitBtn} ${sendStatus === 'sending' ? styles.submitBtnSending : ''} ${sendStatus === 'success' ? styles.submitBtnSuccess : ''}`}
                    strength={0.15}
                    disabled={sendStatus === 'sending'}
                  >
                    {sendStatus === 'idle' && (
                      <>
                        <span>Send Message</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                    {sendStatus === 'sending' && (
                      <>
                        <span>Mengirim...</span>
                        <Loader2 size={18} className={styles.spinnerIcon} />
                      </>
                    )}
                    {sendStatus === 'success' && (
                      <>
                        <span>Pesan Terkirim!</span>
                        <Check size={18} />
                      </>
                    )}
                    {sendStatus === 'error' && (
                      <>
                        <span>Gagal Mengirim</span>
                        <AlertCircle size={18} />
                      </>
                    )}
                  </MagneticButton>
                  
                  {sendStatus === 'idle' && (
                    <span className={styles.responseNotice}>
                      <Sparkles size={14} className={styles.sparkleIcon} />
                      Respon cepat dalam 24 jam
                    </span>
                  )}

                  {sendStatus === 'success' && (
                    <span className={`${styles.responseNotice} ${styles.successNotice}`}>
                      <Check size={14} />
                      Pesan berhasil dikirim ke email saya!
                    </span>
                  )}

                  {sendStatus === 'error' && (
                    <span className={`${styles.responseNotice} ${styles.errorNotice}`}>
                      <AlertCircle size={14} />
                      {errorMessage}
                    </span>
                  )}
                </div>
              </form>
            </div>
          </ScrollReveal>

          {/* Right: Info & Availability Cards */}
          <ScrollReveal delay={0.25}>
            <div className={styles.contactInfoWrapper}>
              {/* Availability Status Card */}
              <div className={styles.availabilityCard}>
                <div className={styles.statusHeader}>
                  <div className={styles.statusIndicator}>
                    <span className={styles.statusPing}></span>
                    <span className={styles.statusDot}></span>
                  </div>
                  <span className={styles.statusBadge}>Status: Active</span>
                </div>
                <h4 className={styles.availabilityTitle}>Currently Available</h4>
                <p className={styles.availabilityText}>
                  Saya siap menerima tawaran proyek freelance baru, konsultasi teknis, atau peluang kerja sama jangka panjang.
                </p>
              </div>

              {/* Direct Channels Card */}
              <div className={styles.channelsCard}>
                <div className={styles.channelItem}>
                  <div className={styles.channelIconWrapper}>
                    <Mail size={20} />
                  </div>
                  <div className={styles.channelContent}>
                    <span className={styles.channelLabel}>Email Address</span>
                    <div className={styles.emailRow}>
                      <a href={`mailto:${contactEmail}`} className={styles.channelValue}>
                        {contactEmail}
                      </a>
                      <button 
                        type="button" 
                        onClick={handleCopyEmail} 
                        className={styles.copyBtn} 
                        title="Copy email to clipboard"
                      >
                        {copied ? <Check size={14} className={styles.copySuccess} /> : <Copy size={14} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.channelDivider}></div>

                <div className={styles.channelItem}>
                  <div className={styles.channelIconWrapper}>
                    <MapPin size={20} />
                  </div>
                  <div className={styles.channelContent}>
                    <span className={styles.channelLabel}>Location & Timezone</span>
                    <span className={styles.channelValue}>Indonesia • Available Worldwide (Remote)</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
