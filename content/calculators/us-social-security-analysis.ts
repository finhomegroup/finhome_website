// Copy for /cong-cu/phan-tich-an-sinh-xa-hoi/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true and CalculatorPage renders the us-rules notice.
//
// Takes the PIA as an input, so this page needs none of the annually
// indexed bend points — see lib/calc/us-social-security.ts.
//
// Figures quoted are claimingAnalysis's output, verified by running it on
// this page's own defaults (PIA 2.800 USD; sinh 1963, tuổi hưởng đủ 67;
// phân tích đến tuổi 85; lãi suất chiết khấu 3%/năm):
//   Khoản nhận: 62 -> 1.960; 67 -> 2.800; 70 -> 3.472 USD/tháng
//   Tổng danh nghĩa đến 85: 62 -> 540.960; 67 -> 604.800; 70 -> 624.960
//   Giá trị hiện tại ở mức 3%: 62 -> 390.426; 68 -> 403.341 (CAO NHẤT);
//     70 -> 395.607 — nên phương án tốt nhất là 68, không phải 70
//   Tuổi hòa vốn so với nhận ở 62, tính trên tổng danh nghĩa:
//     63 -> 77,00; 64 -> 78,00; 65 -> 77,62; 66 -> 78,01; 67 -> 78,67;
//     68 -> 79,05; 69 -> 79,65; 70 -> 80,37
//     KHÔNG đơn điệu: nó ĐỈNH ở 78,00 với tuổi 64 rồi TỤT xuống 77,62 ở 65
//   Nếu chỉ sống đến 78, tổng danh nghĩa cao nhất là ở tuổi 65 (378.456),
//     hơn cả nhận ở 62 (376.320) và nhận ở 70 (333.312)
//   Đến tuổi 95 ở mức chiết khấu 3%: cả hai thước đo đều chọn tuổi 70
//     (tổng 1.041.600; giá trị hiện tại 576.112)

export const US_SOCIAL_SECURITY_ANALYSIS = {
  slug: "/cong-cu/phan-tich-an-sinh-xa-hoi",

  pageTitle: "Phân tích an sinh xã hội",
  metaTitle: "Phân tích an sinh xã hội — Tuổi bắt đầu nhận và điểm hòa vốn",
  metaDescription:
    "So sánh tổng tiền nhận cả đời ở từng tuổi bắt đầu nhận trợ cấp an sinh xã hội Hoa Kỳ, tính điểm hòa vốn và giá trị hiện tại theo lãi suất chiết khấu. Công cụ miễn phí của FinHome.",

  lede:
    "Chờ thêm một năm để nhận trợ cấp cao hơn là một phép đổi: khoản nhận mỗi tháng lớn hơn, số tháng được nhận ít hơn. Trang này tính cả hai vế cho từng tuổi từ 62 đến 70, và trả về hai câu trả lời khác nhau — một theo tổng tiền, một theo giá trị hiện tại — vì chúng thường không trùng nhau.",

  form: {
    benefitGroup: "Trợ cấp của bạn",
    piaLabel: "Mức trợ cấp cơ bản (PIA)",
    piaUnit: "USD/tháng",
    piaHelp:
      "Lấy từ tài khoản my Social Security — đó là khoản nhận ở đúng tuổi hưởng đủ. Nếu chưa có, dùng trang ước tính an sinh xã hội trong bộ công cụ này.",
    birthYearLabel: "Năm sinh",
    birthYearHelp: "Quyết định tuổi hưởng đủ của bạn.",

    horizonGroup: "Giả định",
    endAgeLabel: "Phân tích đến tuổi",
    endAgeUnit: "tuổi",
    endAgeHelp:
      "Đây là biến quyết định kết quả, và nó là một phỏng đoán về chính bạn. Kỳ vọng sống là số TRUNG VỊ: một nửa số người sống lâu hơn thế, nên nhập cao hơn kỳ vọng nếu sức khỏe gia đình bạn tốt.",
    discountLabel: "Lãi suất chiết khấu",
    discountUnit: "%/năm",
    discountHelp:
      "Mức bạn coi một đồng hôm nay đáng hơn một đồng năm sau. Đặt 0 để so tổng tiền thuần. Đặt bằng lợi suất bạn kỳ vọng nếu bạn có tài sản khác để sống trong lúc chờ.",

    piaInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    yearInvalid: "Vui lòng nhập một năm sinh từ 1900 đến 2100.",
    endAgeInvalid: "Vui lòng nhập một tuổi nguyên từ 63 đến 120.",
    discountInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    defaults: {
      pia: "2.800",
      birthYear: "1963",
      endAge: "85",
      discount: "3",
    },

    resultTitle: "Hai câu trả lời",
    bestNominalLabel: "Tốt nhất theo tổng tiền nhận",
    bestPvLabel: "Tốt nhất theo giá trị hiện tại",
    breakEven70Label: "Tuổi hòa vốn của nhận ở 70 so với nhận ở 62",
    fraLabel: "Tuổi hưởng đủ của bạn",

    detailTitle: "Chi tiết hai phương án đầu và cuối",
    earlyMonthlyLabel: "Nhận ở 62, mỗi tháng",
    lateMonthlyLabel: "Nhận ở 70, mỗi tháng",
    earlyTotalLabel: "Nhận ở 62, tổng đến tuổi kết thúc",
    lateTotalLabel: "Nhận ở 70, tổng đến tuổi kết thúc",
    earlyPvLabel: "Nhận ở 62, giá trị hiện tại",
    latePvLabel: "Nhận ở 70, giá trị hiện tại",

    table: {
      caption: "Từng tuổi bắt đầu nhận",
      ageColumn: "Tuổi nhận",
      monthlyColumn: "Mỗi tháng",
      monthsColumn: "Số tháng nhận",
      totalColumn: "Tổng danh nghĩa",
      pvColumn: "Giá trị hiện tại",
      breakEvenColumn: "Hòa vốn so với 62",
      never: "—",
      intro:
        "Cột “hòa vốn so với 62” không đi lên đều: nó đỉnh ở 78,00 tuổi với phương án nhận ở 64 rồi TỤT xuống 77,62 ở tuổi 65. Đó không phải lỗi làm tròn mà là hệ quả của thang giảm hai bậc — phần giải thích nằm ở mục cách tính bên dưới.",
    },

    interiorNotice:
      "Phương án tốt nhất trong bảng không nằm ở hai đầu. Điều đó xảy ra thường xuyên hơn người ta tưởng, vì mức thưởng cho việc chờ không đều: mỗi năm chờ trong khoảng 62–64 chỉ được cộng 5 điểm phần trăm, khoảng 64–67 được 6,67 điểm, còn sau tuổi hưởng đủ được 8 điểm. Hãy đọc cả cột thay vì chỉ so hai dòng đầu và cuối.",
    disagreeNotice:
      "Hai thước đo cho hai câu trả lời khác nhau, và điều đó là bình thường. Tổng tiền nhận trả lời “tôi nhận được nhiều tiền nhất khi nào”; giá trị hiện tại trả lời “dòng tiền nào đáng nhất với tôi hôm nay”. Nếu bạn có tài sản khác để sống trong lúc chờ thì thước đo thứ hai là thước đo của bạn; nếu trợ cấp này là nguồn thu nhập chính thì thước đo thứ nhất mới đúng, và một lãi suất chiết khấu cao trong trường hợp đó chỉ là cách để một con số đồng ý với điều bạn đã muốn làm.",
    agreeNotice:
      "Cả hai thước đo cùng chọn một tuổi, nên kết luận ở đây vững hơn bình thường. Vẫn còn hai điều bảng này không nói: nó không biết bạn sống bao lâu, và nó không tính phần trợ cấp cho người còn sống — với các cặp vợ chồng có mức thu nhập lệch nhau, đó thường là lý do mạnh nhất để người thu nhập cao hơn chờ. Trang chi trả an sinh xã hội trong bộ công cụ này tính riêng phần đó.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Tuổi kết thúc phải lớn hơn 62 và không quá 120.",
  },

  twoAnswersNotice:
    "Với các giá trị mặc định — sống đến 85, chiết khấu 3% một năm — hai thước đo không trùng nhau. Theo tổng tiền nhận, chờ đến 70 là tốt nhất: 624.960 USD so với 540.960 USD nếu nhận ở 62. Theo giá trị hiện tại, tốt nhất lại là tuổi 68 với 403.341 USD, và nhận ở 70 chỉ được 395.607 USD — thấp hơn cả tuổi 68, vì tám năm không có thu nhập là tám năm bạn phải sống bằng tiền khác. Điểm hòa vốn của phương án 70 so với phương án 62 là 80 tuổi 4 tháng: sống qua mốc đó thì chờ có lợi trên tổng tiền, không qua thì không.",

  formula: {
    title: "Cách tính",
    body: [
      "Khoản nhận mỗi tháng ở từng tuổi được tính từ mức trợ cấp cơ bản của bạn theo thang của luật: giảm 5/9 của 1% mỗi tháng cho 36 tháng đầu trước tuổi hưởng đủ, 5/12 của 1% cho các tháng xa hơn, và cộng 2/3 của 1% mỗi tháng nếu nhận sau tuổi hưởng đủ, dừng ở tuổi 70. Số tiền hằng tháng được làm tròn xuống đến đô-la, đúng theo quy định.",
      "Tổng danh nghĩa là khoản mỗi tháng nhân số tháng từ tuổi bắt đầu nhận đến tuổi kết thúc. Không chiết khấu, không tính điều chỉnh theo giá sinh hoạt — vì phần điều chỉnh đó áp cho mọi phương án theo cùng một tỷ lệ nên nó gần như không làm thay đổi việc phương án nào thắng.",
      "Giá trị hiện tại chiết khấu cùng dòng tiền đó về tuổi 62 — cùng một mốc cho cả chín phương án, để chín con số so được với nhau. Nếu mỗi phương án được chiết khấu về ngày bắt đầu của riêng nó thì các tuổi muộn sẽ trông đẹp hơn thực tế, đúng bằng những năm chúng không được trả.",
      "Điểm hòa vốn được tính trên tổng DANH NGHĨA, vì đó là cách câu hỏi luôn được đặt: phải sống bao lâu thì việc chờ mới có lợi. Lãi suất chiết khấu thuộc về cột giá trị hiện tại; trộn hai thứ vào nhau sẽ trả lời một câu hỏi không ai hỏi.",
      "Cột hòa vốn không đơn điệu, và đây là lý do. Chờ từ 62 lên 64 chỉ được cộng 5 điểm phần trăm mỗi năm, vì những tháng đó nằm ở bậc 5/12 của thang giảm. Chờ từ 64 lên 67 được 6,67 điểm mỗi năm ở bậc 5/9. Chờ sau tuổi hưởng đủ được 8 điểm mỗi năm. Mức thưởng cho việc chờ TĂNG DẦN, nên hai năm đầu tiên sau 62 là khoảng đắt nhất — và điểm hòa vốn của phương án 64 (78,00 tuổi) xa hơn của phương án 65 (77,62 tuổi).",
      "Hệ quả thực tế của điều trên: phương án tốt nhất có thể nằm ở GIỮA bảng. Nếu bạn chỉ sống đến 78, tổng danh nghĩa cao nhất là ở tuổi 65 với 378.456 USD — hơn cả nhận ở 62 (376.320 USD) và hơn nhiều so với chờ đến 70 (333.312 USD). Đừng chỉ so hai dòng đầu và cuối.",
      "Trang này không tính: thuế trên trợ cấp, phép thử thu nhập nếu bạn còn làm việc, trợ cấp theo vợ/chồng và trợ cấp cho người còn sống. Hai khoản cuối có thể làm đổi kết luận với người đã kết hôn và được tính ở trang chi trả an sinh xã hội.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên nhập tuổi kết thúc là bao nhiêu?",
        a: "Cao hơn kỳ vọng sống, không phải bằng. Kỳ vọng sống là số trung vị: một nửa số người sống lâu hơn nó. Nếu bạn nhập đúng tuổi kỳ vọng thì bạn đang tối ưu cho một kịch bản mà bạn có 50% khả năng vượt qua — và trong nửa còn lại, việc nhận sớm khiến bạn sống nhiều năm với khoản trợ cấp thấp hơn. Có một cách nghĩ khác giúp thoát khỏi việc phải đoán: trợ cấp an sinh xã hội là khoản thu nhập duy nhất của bạn vừa kéo dài suốt đời vừa được điều chỉnh theo lạm phát, nên vai trò tự nhiên của nó là bảo hiểm cho trường hợp sống RẤT lâu. Bảo hiểm thì nên mua ở mức cao nhất, tức là chờ.",
      },
      {
        q: "Vì sao cột hòa vốn lại tụt xuống ở tuổi 65?",
        a: "Vì thang giảm khi nhận sớm có hai bậc. Trong 36 tháng gần tuổi hưởng đủ nhất, mỗi tháng chờ thêm được cộng 5/9 của 1%; các tháng xa hơn chỉ được 5/12 của 1%. Với tuổi hưởng đủ 67, khoảng 62–64 nằm ở bậc thấp hơn, nên chờ từ 62 lên 64 chỉ được thêm 5 điểm phần trăm mỗi năm, còn từ 64 lên 65 được 6,67 điểm. Vì phần thưởng cho việc chờ tăng dần, phương án 64 có điểm hòa vốn xa hơn phương án 65 — 78,00 tuổi so với 77,62. Nói theo cách dùng được: nếu bạn đã quyết định không chờ đến tuổi hưởng đủ thì 62 hoặc 65 là hai mốc đáng cân nhắc hơn 63 và 64.",
        },
      {
        q: "Lãi suất chiết khấu nên là bao nhiêu?",
        a: "Phụ thuộc bạn có gì khác để sống trong lúc chờ. Nếu bạn có một danh mục đầu tư và việc chờ nghĩa là rút thêm từ đó, thì lãi suất chiết khấu hợp lý là lợi suất bạn kỳ vọng ở danh mục ấy — bạn đang so “nhận trợ cấp sớm” với “để tiền trong danh mục lâu hơn”. Nếu trợ cấp này là nguồn thu nhập chính và bạn không có tài sản nào khác, thì lãi suất chiết khấu cao không mô tả tình huống của bạn: bạn không có cơ hội đầu tư nào để bỏ lỡ, và cột tổng tiền mới là cột của bạn. Điều đáng tránh là chọn một mức chiết khấu cao chỉ để một con số đồng ý với quyết định mình đã muốn.",
      },
      {
        q: "Trang này có tính đến việc tôi đã kết hôn không?",
        a: "Không, và với người đã kết hôn thì đó là một thiếu sót đủ lớn để làm đổi kết luận. Trợ cấp cho người còn sống được tính trên khoản THỰC NHẬN của người đã mất, nên nếu bạn là người có mức trợ cấp cao hơn trong nhà, việc bạn nhận sớm làm giảm cả khoản của bạn khi còn sống VÀ khoản của người còn lại sau khi bạn mất. Với một cặp vợ chồng lệch thu nhập, cách thường được dùng là người có mức cao hơn chờ càng lâu càng tốt còn người kia nhận sớm. Trang chi trả an sinh xã hội trong bộ công cụ này tính đúng phần đó.",
      },
      {
        q: "Điều chỉnh theo giá sinh hoạt có làm đổi kết luận không?",
        a: "Gần như không, và đó là lý do công cụ không mô hình hóa nó. Phần điều chỉnh này áp cho mọi phương án theo cùng một tỷ lệ phần trăm, nên nó phóng to tất cả các con số mà gần như giữ nguyên thứ tự giữa chúng. Tác động nhỏ còn lại thực ra có lợi cho việc chờ: phần điều chỉnh được cộng lên một khoản gốc lớn hơn. Nếu bạn muốn đọc kết quả theo giá của tương lai thì hãy nhân lên, còn nếu muốn so các phương án với nhau thì các con số ở đây đã đủ.",
      },
    ],
  },
} as const;
