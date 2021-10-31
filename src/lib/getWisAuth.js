const puppeteer = require('puppeteer');

const getWisAuth = async (wis_id, wis_password) => {
  const browser = await puppeteer.launch();

  const majorPage = await browser.newPage();
  const etcPage = await browser.newPage();

  // 전공, 캠퍼스 정보
  await majorPage.goto('https://wis.hufs.ac.kr');
  await majorPage.waitForSelector('#password');

  await majorPage.evaluate(
    (wis_id, wis_password) => {
      document.querySelector(
        'body > div > form:nth-child(5) > div.login_wrap > div > div.login_right > div > input[type="text"]:nth-child(1)'
      ).value = wis_id;
      document.querySelector('#password').value = wis_password;
    },
    await wis_id,
    await wis_password
  );

  await majorPage.click(
    'body > div > form:nth-child(5) > div.login_wrap > div > div.login_right > div > a'
  );

  await majorPage.on('dialog', async (dialog) => {
    await dialog.dismiss();
    await browser.close();
  });

  await majorPage.waitForTimeout(500);

  await majorPage.goto(
    'https://wis.hufs.ac.kr/src08/jsp/major/MAJOR0100L_List.jsp?tab_lang=K'
  );

  await majorPage.waitForSelector(
    'body > div > form > div > table > tbody > tr:nth-child(1) > td'
  );

  const campus_selector = await majorPage.$(
    'body > div > form > div > table > tbody > tr:nth-child(1) > td'
  );

  const major_selector = await majorPage.$(
    'body > div > form > div > table > tbody > tr:nth-child(1) > td > span'
  );

  const campus = await majorPage.evaluate(
    (el) => el.textContent,
    campus_selector
  );

  const major = await majorPage.evaluate(
    (el) => el.textContent,
    major_selector
  );

  // 기타 정보
  await etcPage.goto(
    'https://wis.hufs.ac.kr/src08/jsp/stuinfo_10/STUINFO1000C_myinfo.jsp'
  );

  await etcPage.on('dialog', async (dialog) => {
    await dialog.dismiss();
    await browser.close();
  });

  await etcPage.waitForSelector(
    'body > div > table > tbody > tr:nth-child(2) > td:nth-child(2)'
  );

  const studentIdSelector = await etcPage.$(
    'body > div > table > tbody > tr:nth-child(2) > td:nth-child(2)'
  );

  let studentId = await etcPage.evaluate(
    (el) => el.textContent,
    studentIdSelector
  );

  await browser.close();

  return [campus, major, studentId];
};

module.exports = getWisAuth;
