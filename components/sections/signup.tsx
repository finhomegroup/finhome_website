import { SIGNUP_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

export function Signup() {
  return (
    <section id="dangky" className="py-12 md:py-[50px]">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="fh-h2 text-ink">{SIGNUP_SECTION.title}</h2>
            <p className="fh-lead mt-4">
              {SIGNUP_SECTION.subtitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>

            <form className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <input
                type="email"
                required
                name="Email"
                placeholder={SIGNUP_SECTION.placeholder}
                aria-label={SIGNUP_SECTION.placeholder}
                className="h-[52px] w-full min-w-0 flex-1 rounded-[34px] border border-[#c7c7c7] bg-white px-5 font-display-book text-base text-ink placeholder:text-[rgb(87,87,87)] outline-none transition-colors focus:border-brand-green"
              />
              <button
                type="submit"
                className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-[34px] border border-[#c7c7c7] bg-[#f7f7f7] px-8 font-display text-[17px] font-medium text-[rgb(87,87,87)] transition-colors hover:bg-[#efefef]"
              >
                {SIGNUP_SECTION.cta}
              </button>
            </form>

            <div className="mt-7 flex flex-col items-center gap-2">
              <div className="flex justify-center -space-x-2">
                {SIGNUP_SECTION.avatars.map((avatar) => (
                  <img
                    key={avatar}
                    src={img(avatar)}
                    alt=""
                    aria-hidden="true"
                    className="size-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="fh-body text-center text-[rgb(87,87,87)]">
                {SIGNUP_SECTION.socialProof}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
