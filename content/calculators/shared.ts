// Copy shared by every calculator in the suite.
//
// `disclaimer` is the text a calculator shows below its results when it does
// not override it. It was written for the Rule of 72 calculator and then
// inherited by all 75, which is how it came to assert things that are FALSE
// on most of them.
//
// THE DEFAULT IS NOW NEUTRAL AND CONDITIONAL, and that is the point. The old
// text stated flatly that the tool "dựa trên mức lãi suất do bạn tự nhập và
// giả định lãi suất không đổi" and that "kết quả không trừ thuế, phí và lạm
// phát". Neither survives contact with the suite:
//
//   * /cong-cu/tinh-phan-tram/ has no rate box at all — 30% of 2 tỷ assumes
//     no interest rate, constant or otherwise. An independent review found
//     that sentence under exactly that result.
//   * /cong-cu/tinh-ngay/ counts days. /cong-cu/doi-don-vi/ converts units.
//   * /cong-cu/phan-phoi-rong/ SUBTRACTS the fees the reader entered, so
//     "không trừ phí" was the opposite of what the page does.
//
// THE FIRST REWRITE WAS STILL INFERRING SEMANTICS FROM THE FORM, and that is
// the second defect this text has had. It said "Nếu công cụ có ô lãi suất,
// kết quả giả định mức lãi đó giữ nguyên trong suốt thời gian được tính" and
// "Thuế, phí và lạm phát chỉ được tính khi trang có ô để bạn nhập chúng".
// Both read a field as if it defined the model, and neither survives either:
//
//   * /cong-cu/ke-hoach-huu-tri/ renders this default and its model uses
//     DIFFERENT returns before and after retirement, so "mức lãi đó giữ
//     nguyên trong suốt thời gian" is false on a page with rate fields.
//   * /cong-cu/thue-luong-hoa-ky/ computes statutory payroll tax the reader
//     never types a rate for, so "thuế … chỉ được tính khi trang có ô" is
//     false in the other direction.
//
// A shared fallback cannot know any of this. It now says only what is true of
// all 75 — the figures come from the inputs AND the assumptions written on
// that page — and sends the reader to the page's own stated scope for rates,
// taxes, fees and inflation, instead of guessing at it from the form. Where
// the assumptions matter, the route overrides this text: `floating-loan`,
// `refinance`, `net-distribution`, `fuel`, `asset-allocation`, `units` and
// others do, and those overrides are the accurate ones. Keep them.
// `scripts/check-built-markup.mjs` counts the shared opening clause, so an
// override replaces what FOLLOWS it and never the clause itself.
//
// `usRulesNotice` is shown ABOVE the calculator, not below, on the ~29 tools
// governed by United States tax and retirement law. Those tools are built for
// parity with the reference site but do not apply to Vietnamese users, and
// burying that at the bottom of the page would not be telling them.

export const CALCULATOR_COPY = {
  // The shouted "VÀ" here was the last mid-sentence capital in the suite, and
  // the most-rendered string in it: this disclaimer ships on all 75 pages.
  //
  // It cannot be fixed the way every other row's shouting was. Declared
  // emphasis renders `<strong>`, and `scripts/check-built-markup.mjs` now
  // fails any page that ships `<strong>` while not filed `emphasis` — so
  // emphasising a string shared by 61 non-`emphasis` pages would turn the
  // deploy gate red on all of them.
  //
  // So the conjunction carries the weight in words instead: "và cả" says the
  // thing the capitals were shouting — that the assumptions count too, not
  // only the reader's own inputs, which is the misreading the sentence exists
  // to block.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa: kết quả phụ thuộc vào những con số bạn nhập và cả các giả định được ghi trên trang này. Mỗi công cụ có phạm vi riêng — lãi suất, thuế, phí và lạm phát được tính hay không tính là điều nêu ngay tại phần giả định và giới hạn của trang, nên hãy đọc phần đó trước khi dùng con số vào việc gì. Kết quả không phải cam kết lợi nhuận và không phải lời khuyên đầu tư. Vui lòng cân nhắc kỹ hoặc tham khảo chuyên gia trước khi ra quyết định tài chính.",

  usRulesNotice:
    "Công cụ này mô phỏng quy định về thuế và hưu trí của Hoa Kỳ. Kết quả không áp dụng cho người dùng tại Việt Nam và không phản ánh pháp luật thuế, bảo hiểm xã hội hay hưu trí của Việt Nam. Công cụ được cung cấp để tham khảo và đối chiếu.",
} as const;
