// The official widget enables SimplyBook's iframe session handling and resizing.
(() => {
  const container = document.getElementById('maxgym-booking');
  if (!container || typeof SimplybookWidget !== 'function') return;

  const widget = new SimplybookWidget({
    container_id: container.id,
    widget_type: 'iframe',
    url: 'https://maxgymbratislava.simplybook.it',
    theme: 'default',
    // Existing SimplyBook "Mocco" appearance, verified on 26 October 2026.
    theme_settings: {
      timeline_hide_unavailable: '1',
      hide_past_days: '0',
      timeline_show_end_time: '0',
      timeline_modern_display: 'as_slots',
      sb_base_color: '#836055',
      display_item_mode: 'block',
      booking_nav_bg_color: '#836055',
      body_bg_color: '#F7F7F7',
      sb_logo_image: '',
      sb_logo_image_mode: 'company-logo-and-name',
      sb_background_image: '',
      sb_background_image_mode: 'cover',
      sb_background_image_position: 'center',
      sb_review_image: '',
      dark_font_color: '#443936',
      light_font_color: '#FFFFFF',
      btn_color_1: '#A1776A',
      main_page_mode: 'default',
      sb_company_label_color: '#FFFFFF',
      hide_img_mode: 1,
      show_sidebar: '1',
      sb_busy: '#c7b3b3',
      sb_available: '#e2eaec'
    }
  });

  if (widget.frame) widget.frame.title = container.dataset.title;
})();
