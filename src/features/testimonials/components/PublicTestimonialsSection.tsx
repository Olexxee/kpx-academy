import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Quote, Send, Sparkles, Star, X } from "lucide-react";
import {
  getPublicTestimonials,
  submitTestimonial,
} from "../api";
import type { CreateTestimonialInput, Testimonial } from "../types";
import "./testimonials.css";

const publicTestimonialsKey = ["testimonials", "public"] as const;

export function PublicTestimonialsSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const testimonialsQuery = useQuery({
    queryKey: publicTestimonialsKey,
    queryFn: getPublicTestimonials,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const openForm = () => {
    setIsSubmitted(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isFormOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setIsFormOpen(false); window.requestAnimationFrame(() => triggerRef.current?.focus()); }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFormOpen]);

  const handleSuccess = () => {
    setIsFormOpen(false);
    setIsSubmitted(true);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const testimonials = testimonialsQuery.data ?? [];

  return (
    <section
      id="testimonials"
      className="kpx-testimonials relative isolate overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="kpx-testimonials__atmosphere" aria-hidden="true">
        <span className="kpx-testimonials__halo kpx-testimonials__halo--one" />
        <span className="kpx-testimonials__halo kpx-testimonials__halo--two" />
        <span className="kpx-testimonials__orbit kpx-testimonials__orbit--one" />
        <span className="kpx-testimonials__orbit kpx-testimonials__orbit--two" />
        <span className="kpx-testimonials__orbit-dot" />
        <span className="kpx-testimonials__spark kpx-testimonials__spark--one" />
        <span className="kpx-testimonials__spark kpx-testimonials__spark--two" />
        <span className="kpx-testimonials__spark kpx-testimonials__spark--three" />
      </div>

      <div className="kpx-testimonials__inner">
        <header className="kpx-testimonials__header">
          <div className="kpx-testimonials__eyebrow">
            <span />
            <Sparkles size={14} aria-hidden="true" />
            Learner stories
            <span />
          </div>
          <h2 id="testimonials-heading">
            Real experiences.
            <span> Practical progress.</span>
          </h2>
          <p>
            The most meaningful measure of our work is what learners take
            forward. Here are a few words from people who have learned with KPX.
          </p>
        </header>

        {testimonialsQuery.isPending ? (
          <div className="kpx-testimonials__grid" aria-label="Loading testimonials">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="kpx-testimonial-skeleton" key={index}>
                <span />
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : testimonialsQuery.isError ? (
          <div className="kpx-testimonials__feedback" role="alert">
            <p>We couldn't load the testimonials right now.</p>
            <button type="button" onClick={() => void testimonialsQuery.refetch()}>
              Try again <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="kpx-testimonials__feedback">
            <Quote size={25} aria-hidden="true" />
            <p>Our learner stories will appear here as testimonials are approved.</p>
          </div>
        ) : (
          <div className="kpx-testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        )}

        <div className="kpx-testimonials__footer">
          <div>
            <span className="kpx-testimonials__footer-kicker">Your experience matters</span>
            <p>Have you learned with us? Share what the experience was like.</p>
          </div>
          <button
            ref={triggerRef}
            type="button"
            className="kpx-testimonials__cta"
            onClick={openForm}
          >
            Share your experience <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>

        {isSubmitted && (
          <p className="kpx-testimonials__success" role="status" aria-live="polite">
            Thank you. Your testimonial has been submitted and is awaiting review.
          </p>
        )}
      </div>

      {isFormOpen && (
        <div
          className="kpx-testimonials__modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="kpx-testimonials__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="testimonial-form-heading"
          >
            <button
              type="button"
              className="kpx-testimonials__modal-close"
              onClick={closeForm}
              aria-label="Close testimonial form"
            >
              <X size={20} />
            </button>
            <span className="kpx-testimonials__footer-kicker">Learner stories</span>
            <h3 id="testimonial-form-heading">Share your experience</h3>
            <p className="kpx-testimonials__modal-intro">
              Tell us what you learned and how the experience helped you. Your
              testimonial will be reviewed before it appears publicly.
            </p>
            <TestimonialSubmissionForm onSuccess={handleSuccess} onCancel={closeForm} />
          </section>
        </div>
      )}
    </section>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  const rating = Math.max(0, Math.min(Math.round(testimonial.rating || 0), 5));
  const initials = testimonial.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article
      className="kpx-testimonial-card"
      style={{ "--card-index": index % 8 } as CSSProperties}
    >
      <div className="kpx-testimonial-card__topline" aria-hidden="true" />
      <div className="kpx-testimonial-card__meta">
        <Quote size={25} aria-hidden="true" />
        <div className="kpx-testimonial-card__rating" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, starIndex) => (
            <Star
              key={starIndex}
              size={14}
              aria-hidden="true"
              className={starIndex < rating ? "is-filled" : ""}
            />
          ))}
        </div>
      </div>
      <p className="kpx-testimonial-card__message">{testimonial.message}</p>
      <div className="kpx-testimonial-card__author">
        {testimonial.imageUrl ? (
          <img
            src={testimonial.imageUrl}
            alt=""
            loading="lazy"
            className="kpx-testimonial-card__avatar"
          />
        ) : (
          <span className="kpx-testimonial-card__avatar kpx-testimonial-card__avatar--initials">
            {initials || "K"}
          </span>
        )}
        <div className="kpx-testimonial-card__identity">
          <strong>{testimonial.name}</strong>
          {testimonial.role && <span>{testimonial.role}</span>}
        </div>
      </div>
    </article>
  );
}

function TestimonialSubmissionForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: CreateTestimonialInput) => submitTestimonial(payload),
    onSuccess,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({
      name: name.trim(),
      role: role.trim() || undefined,
      message: message.trim(),
      rating,
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  const errorMessage = mutation.error
    ? isAxiosError<{ message?: string }>(mutation.error)
      ? mutation.error.response?.data?.message ?? "Unable to submit your testimonial. Please try again."
      : mutation.error instanceof Error
        ? mutation.error.message
        : "Unable to submit your testimonial. Please try again."
    : "";

  return (
    <form className="kpx-testimonial-form" onSubmit={handleSubmit}>
      <label>
        Your name
        <input
          autoFocus
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your full name"
        />
      </label>

      <label>
        Role or course <span>(optional)</span>
        <input
          maxLength={100}
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="e.g. Resin Art Learner"
        />
      </label>

      <fieldset className="kpx-testimonial-form__rating">
        <legend>Your rating</legend>
        <div>
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`Give ${value} star${value === 1 ? "" : "s"}`}
                aria-pressed={rating === value}
              >
                <Star className={value <= rating ? "is-filled" : ""} size={23} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <label>
        Your experience
        <textarea
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What did you learn? What stood out about your experience?"
        />
        <span className="kpx-testimonial-form__counter">{message.length}/1000</span>
      </label>

      <label>
        Profile image URL <span>(optional)</span>
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://..."
        />
      </label>

      {mutation.isError && (
        <p className="kpx-testimonial-form__error" role="alert">{errorMessage}</p>
      )}

      <div className="kpx-testimonial-form__actions">
        <button type="button" className="kpx-testimonial-form__cancel" onClick={onCancel} disabled={mutation.isPending}>
          Cancel
        </button>
        <button
          type="submit"
          className="kpx-testimonial-form__submit"
          disabled={mutation.isPending || !name.trim() || message.trim().length < 10}
        >
          {mutation.isPending ? "Submitting..." : "Submit testimonial"}
          {!mutation.isPending && <Send size={15} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
