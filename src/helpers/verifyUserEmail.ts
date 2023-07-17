import { paramsStringify } from './queryParams';

const getVerificationEmailTemplate = ({
	redirectDomain,
	user,
	token
}: {
	redirectDomain: string;
	user: any;
	token: string;
}) => {
	return /* html */ `
			<div>
				<p>
					Thân gửi ${user.displayName}!
					<p>
						Người dùng nhận được mail vui lòng click vào <a href='${
							redirectDomain + '/api/auth/verify-account' + paramsStringify({ _role: user.role, _token: token })
						}'>link</a> này để xác thực tài khoản.
					</p>
					<i>Lưu ý: Mail xác thực này có hiệu lực trong vòng 7 ngày</i>
				</p>
				<hr>
				<p>
					<span style="display: block">Trân trọng!</span>
					<i>Cửa hàng thời trang suesue</i>
				</p>
			</div>
					`;
};

export default getVerificationEmailTemplate;