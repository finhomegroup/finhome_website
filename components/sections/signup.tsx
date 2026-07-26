"use client";

import { SIGNUP_SECTION } from "@/content/home";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import { FH_INPUT_SHADOW, FH_POINTER } from "@/lib/interaction-styles";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";

export function Signup() {
  return (
    <section id="dangky" className="scroll-mt-28 py-12 md:scroll-mt-32 md:py-[50px]">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="fh-h2 text-ink">{SIGNUP_SECTION.title}</h2>
            <p className="fh-lead mx-auto mt-4 max-w-xl text-balance">
              {SIGNUP_SECTION.subtitleLines.map((line) => (
                <span key={line} className="inline lg:block">
                  {line}{" "}
                </span>
              ))}
            </p>

            <form
              noValidate
              className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-stretch"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                name="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                placeholder={SIGNUP_SECTION.placeholder}
                aria-label={SIGNUP_SECTION.placeholder}
                className={cn(
                  "box-border min-h-[52px] w-full min-w-0 flex-1 appearance-none rounded-[34px] border border-[#c7c7c7] bg-white px-5 py-3.5 font-display-book text-base leading-normal text-ink caret-brand-green placeholder:text-ink-3 outline-none transition-[border-color,box-shadow] [-webkit-tap-highlight-color:transparent] focus:border-brand-green focus-visible:ring-[3px] focus-visible:ring-brand-green/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:text-[17px]",
                  FH_INPUT_SHADOW,
                )}
              />
              <button
                type="submit"
                className={cn(
                  "inline-flex min-h-[52px] w-full shrink-0 touch-manipulation items-center justify-center rounded-[34px] border border-transparent bg-cta px-8 font-display text-base font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[filter,background-color] [-webkit-tap-highlight-color:transparent] hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[8.5rem] sm:text-[17px] lg:border-[#c7c7c7] lg:bg-[#f7f7f7] lg:text-[rgb(87,87,87)] lg:shadow-none lg:hover:bg-[#efefef] lg:active:bg-[#e8e8e8]",
                  FH_POINTER,
                )}
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
