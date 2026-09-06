// Copy shared by every calculator in the suite.
//
// `disclaimer` is the text every calculator shows below its results. It was
// written for the Rule of 72 calculator and is reproduced here VERBATIM —
// Task 9's retrofit must not change a single rendered character, because the
// built HTML is the regression gate.
//
// `usRulesNotice` is shown ABOVE the calculator, not below, on the ~29 tools
// governed by United States tax and retirement law. Those tools are built for
// parity with the reference site but do not apply to Vietnamese users, and
// burying that at the bottom of the page would not be telling them.

export const CALCULATOR_COPY = {
  disclaimer:
    "Công cụ này chỉ mang tính minh họa, dựa trên mức lãi suất do bạn tự nhập và giả định lãi suất không đổi. Kết quả không trừ thuế, phí và lạm phát, không phải cam kết lợi nhuận và không phải lời khuyên đầu tư. Vui lòng cân nhắc kỹ hoặc tham khảo chuyên gia trước khi ra quyết định tài chính.",

  usRulesNotice:
    "Công cụ này mô phỏng quy định về thuế và hưu trí của Hoa Kỳ. Kết quả không áp dụng cho người dùng tại Việt Nam và không phản ánh pháp luật thuế, bảo hiểm xã hội hay hưu trí của Việt Nam. Công cụ được cung cấp để tham khảo và đối chiếu.",
} as const;
